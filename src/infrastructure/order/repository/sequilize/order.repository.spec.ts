import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;
  let orderRepository: OrderRepository;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();

    orderRepository = new OrderRepository();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
    
  });

  it("should find an order by id", async () => {
    
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    await orderRepository.create(order);

    // Call the find method and assert the result
    const foundOrder = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(foundOrder.id).toBe("123");
    expect(foundOrder.customer_id).toBe("123");
    expect(foundOrder.items.length).toBe(1);
    expect(foundOrder.items[0].quantity).toBe(2);
  });

  it("should find all orders", async () => {
    
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product1 = new Product("123", "Product 1", 10);
    const product2 = new Product("456", "Product 2", 12);
    await productRepository.create(product1);
    await productRepository.create(product2);

    const orderItem = new OrderItem(
      "1",
      product1.name,
      product1.price,
      product1.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    await orderRepository.create(order);

    const orderItem2 = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      1
    );

    const order2 = new Order("456", "123", [orderItem2]);

    await orderRepository.create(order2);

    // Call the find method and assert the result
    const foundOrder = await orderRepository.findAll();

    expect(foundOrder[0].id).toBe("123");
    expect(foundOrder[0].customerId).toBe("123");
    expect(foundOrder[0].items.length).toBe(1);
    expect(foundOrder[0].items[0].quantity).toBe(2);

    expect(foundOrder[1].id).toBe("456");
    expect(foundOrder[1].customerId).toBe("123");
    expect(foundOrder[1].items.length).toBe(1);
    expect(foundOrder[1].items[0].quantity).toBe(1);
  });

  it("should update a order", async () => {
    
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123b", "Customer 1");
    const address = new Address("Street 1b", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123b", "Product 1b", 10);
    const product2 = new Product("456", "Product 2", 10);
    await productRepository.create(product);
    await productRepository.create(product2);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123b", "123b", [orderItem]);

    await orderRepository.create(order);

    // Call the find method and assert the result
    const foundOrder = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(foundOrder.id).toBe("123b");
    expect(foundOrder.customer_id).toBe("123b");
    expect(foundOrder.items.length).toBe(1);
    expect(foundOrder.items[0].quantity).toBe(2);

    foundOrder.items[0].quantity = 3;
    foundOrder.items[0].product_id = product2.id;


    const items = foundOrder.items.map(
      (item) =>
        new OrderItem(
          item.id,
          item.name,
          item.price,
          item.product_id,
          item.quantity
        )
    );
    const updatedOrder = new Order(foundOrder.id, foundOrder.customer_id, items);


    await orderRepository.update(updatedOrder);
    
    const foundUpdatedOrder = await OrderModel.findOne({
      where: { id: foundOrder.id },
      include: ["items"],
    });

    expect(foundUpdatedOrder.items[0].product_id).toBe(product2.id);
    expect(foundUpdatedOrder.items[0].quantity).toBe(3);



  });
  
  
  
});
