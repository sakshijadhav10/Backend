import mongoose from "mongoose"
import Order from "../models/orderModel.js"
import asyncHandler from "express-async-handler"

 


const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body

  if (orderItems?.length === 0) {
    res.status(400)
    throw new Error("No Order Items")
  } else {
    const order = new Order({
      orderItems: orderItems.map(item => ({
        ...item,
        product: item._id,
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    })
    const createdOrder = await order.save()

    res.status(201).json(createdOrder)
  }
})

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  )

  if (order) {
    res.status(200).json(order)
  } else {
    res.status(404)
    throw new Error("Order not found")
  }
})

const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate("user")
  res.json(orders)
})

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "id name")
  res.send(orders)
})
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order removed' });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});
// const updateOrderToDelivered = asyncHandler(async (req, res) => {
//   const order = await Order.findById(req.params.id)
  

  
//   if (order) {
//     order.isDelivered = true
//     order.deliveredAt = Date.now()

//     const updatedOrder = await order.save()

//     res.json(updatedOrder)
//   }
   
//   res.status(404)
//    throw new Error("Order Not Found")
// })
// const updateOrderStatus = asyncHandler(async (req, res) => {
//   const order = await Order.findById(req.params.id);

//   if (order) {
//     order.status = req.body.status || order.status;
//     if (req.body.status === 'Delivered') {
//       order.isDelivered = true;
//       order.deliveredAt = Date.now();
//     }
//     if (req.body.status === 'Processed') {
//       order.isProcessed = true;
//       order.processedAt= Date.now();
//     }
//     const updatedOrder = await order.save();
//     res.json(updatedOrder);
//   } else {
//     res.status(404);
//     throw new Error('Order not found');
//   }
// });

const updateOrderToProcessed = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isProcessed = true;
    order.processedAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// Assign tracking number to the order
const updateOrderToTrackingAssigned = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  const { trackingNumber } = req.body;

  if (order) {
    order.trackingNumber = trackingNumber;
    order.trackingAssignedAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// Mark order as delivered
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});
const setReturnDeadline = asyncHandler(async (req, res) => {
  const { returnDays } = req.body; // returnDays is the number of days for return policy
  const order = await Order.findById(req.params.id);

  if (order) {
    const returnDeadline = new Date(order.deliveredAt);
    returnDeadline.setDate(returnDeadline.getDate() + returnDays);
    order.returnDeadline = returnDeadline;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});
const returnProduct = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    const now = new Date();
    if (order.returnDeadline && now <= order.returnDeadline) {
      order.isReturned = true;
      order.returnedAt = now;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(400);
      throw new Error('Return period has expired');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});


export {
  addOrderItems,
  getOrderById,
  getUserOrders,
  deleteOrder,
  getOrders,
  updateOrderToProcessed ,
  updateOrderToTrackingAssigned,
  updateOrderToDelivered,
  setReturnDeadline,
  returnProduct
}
