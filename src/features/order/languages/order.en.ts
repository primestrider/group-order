export default {
  feature_title: "Order Management",

  create_order: {
    form: {
      orderName: {
        label: "Order Name",
        placeholder: "Enter the order name (example: Order Seblak Mewek)",
        hint: "example: Order Bubble Tea",
      },

      orderDescription: {
        label: "Order Description",
        placeholder: "Optional description for this order",
      },

      maxParticipants: {
        label: "Maximum Participants",
        placeholder: "Maximum number of participants",
      },

      lastOrderAt: {
        label: "Last Order",
        placeholder: "Select the last order date and time",
      },

      button: {
        submit: "Create Order",
      },
    },

    error: "Error when creating order, please try again later.",
  },

  order_detail: {
    add_item: {
      form: {
        title: "Add Your Items",
      },
    },
  },
}
