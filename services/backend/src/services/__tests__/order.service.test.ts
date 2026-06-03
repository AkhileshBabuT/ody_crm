import { describe, it, expect, vi, beforeEach } from "vitest";
import * as orderRepo from "../../repositories/order.repository";
import { createOrder, updateOrderStatus } from "../order.service";
import { AppError } from "../../lib/errors";

vi.mock("../../repositories/order.repository");
const mockRepo = vi.mocked(orderRepo);

const db = {} as any;

beforeEach(() => {
  vi.resetAllMocks();
});

describe("createOrder", () => {
  const baseInput = {
    customerId: 1,
    items: [
      { menuItemId: 1, quantity: 2 },
      { menuItemId: 2, quantity: 3 },
    ],
  };

  const mockCustomer = { id: 1, name: "Alice", email: "alice@test.com" };

  const mockMenuItems = [
    { id: 1, name: "Burger", priceCents: 1000, available: true },
    { id: 2, name: "Fries", priceCents: 500, available: true },
  ];

  it("should successfully create an order with correct totalCents", async () => {
    mockRepo.getCustomerById.mockResolvedValue(mockCustomer as any);
    mockRepo.getMenuItemsByIds.mockResolvedValue(mockMenuItems as any);
    mockRepo.createOrder.mockResolvedValue({
      id: 1,
      customerId: 1,
      totalCents: 3500,
      status: "PENDING",
    } as any);

    await createOrder(db, baseInput);

    expect(mockRepo.createOrder).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        totalCents: 3500,
      }),
    );
  });

  it("should pass correct unitPriceCents from DB for each item", async () => {
    mockRepo.getCustomerById.mockResolvedValue(mockCustomer as any);
    mockRepo.getMenuItemsByIds.mockResolvedValue(mockMenuItems as any);
    mockRepo.createOrder.mockResolvedValue({
      id: 1,
      customerId: 1,
      totalCents: 3500,
      status: "PENDING",
    } as any);

    await createOrder(db, baseInput);

    const callArgs = mockRepo.createOrder.mock.calls[0];
    const orderData = callArgs[1];
    expect(orderData.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ menuItemId: 1, unitPriceCents: 1000 }),
        expect.objectContaining({ menuItemId: 2, unitPriceCents: 500 }),
      ]),
    );
  });

  it("should throw NOT_FOUND if customer does not exist", async () => {
    mockRepo.getCustomerById.mockResolvedValue(undefined as any);

    await expect(createOrder(db, baseInput)).rejects.toThrow(AppError);
    await expect(createOrder(db, baseInput)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("should throw UNAVAILABLE_ITEMS if some items are unavailable", async () => {
    mockRepo.getCustomerById.mockResolvedValue(mockCustomer as any);
    mockRepo.getMenuItemsByIds.mockResolvedValue([
      { id: 1, name: "Burger", priceCents: 1000, available: true },
      { id: 2, name: "Fries", priceCents: 500, available: false },
    ] as any);

    await expect(createOrder(db, baseInput)).rejects.toThrow(AppError);

    try {
      await createOrder(db, baseInput);
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe("UNAVAILABLE_ITEMS");
      expect((err as AppError).details).toEqual(
        expect.objectContaining({
          unavailableItemIds: expect.arrayContaining([2]),
        }),
      );
    }
  });

  it("should throw UNAVAILABLE_ITEMS if item IDs do not exist in DB", async () => {
    mockRepo.getCustomerById.mockResolvedValue(mockCustomer as any);
    // Only return 1 of the 2 requested items
    mockRepo.getMenuItemsByIds.mockResolvedValue([
      { id: 1, name: "Burger", priceCents: 1000, available: true },
    ] as any);

    await expect(createOrder(db, baseInput)).rejects.toThrow(AppError);

    try {
      await createOrder(db, baseInput);
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe("UNAVAILABLE_ITEMS");
      expect((err as AppError).details).toEqual(
        expect.objectContaining({
          unavailableItemIds: expect.arrayContaining([2]),
        }),
      );
    }
  });

  it("should calculate totalCents as sum of quantity * priceCents", async () => {
    mockRepo.getCustomerById.mockResolvedValue(mockCustomer as any);
    mockRepo.getMenuItemsByIds.mockResolvedValue(mockMenuItems as any);
    mockRepo.createOrder.mockResolvedValue({
      id: 1,
      customerId: 1,
      totalCents: 3500,
      status: "PENDING",
    } as any);

    await createOrder(db, baseInput);

    // item 1: 2 * 1000 = 2000, item 2: 3 * 500 = 1500, total = 3500
    expect(mockRepo.createOrder).toHaveBeenCalledWith(
      db,
      expect.objectContaining({ totalCents: 3500 }),
    );
  });
});

describe("updateOrderStatus", () => {
  it("should successfully update order status", async () => {
    const existingOrder = {
      id: 1,
      customerId: 1,
      status: "PENDING",
      totalCents: 3500,
    };
    const updatedOrder = { ...existingOrder, status: "ACCEPTED" };

    mockRepo.getOrderById.mockResolvedValue(existingOrder as any);
    mockRepo.updateOrderStatus.mockResolvedValue(updatedOrder as any);

    const result = await updateOrderStatus(db, 1, "ACCEPTED");

    expect(result).toEqual(updatedOrder);
    expect(mockRepo.updateOrderStatus).toHaveBeenCalledWith(
      db,
      1,
      "ACCEPTED",
      "PENDING",
    );
  });

  it("should throw NOT_FOUND if order does not exist", async () => {
    mockRepo.getOrderById.mockResolvedValue(undefined as any);

    await expect(
      updateOrderStatus(db, 999, "ACCEPTED"),
    ).rejects.toThrow(AppError);

    await expect(
      updateOrderStatus(db, 999, "ACCEPTED"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("should throw INVALID_STATE_TRANSITION for invalid transition", async () => {
    const completedOrder = {
      id: 1,
      customerId: 1,
      status: "COMPLETED",
      totalCents: 3500,
    };

    mockRepo.getOrderById.mockResolvedValue(completedOrder as any);

    await expect(
      updateOrderStatus(db, 1, "PENDING"),
    ).rejects.toThrow(AppError);

    try {
      await updateOrderStatus(db, 1, "PENDING");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe("INVALID_STATE_TRANSITION");
    }
  });
});
