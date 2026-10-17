// =============================================================================
// Kitchen Accountability ERP - Modal Aggregation Facade
// SOLID: Single Responsibility Principle (SRP) & Interface Segregation (ISP)
// Aggregates segregated domain modals (Orders, Vendors, Cooks, Common) into
// unified namespace with 100% backward compatibility.
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};

window.KitchenComponents.Modals = (() => {
  const KC = window.KitchenComponents;

  // Retrieve segregated domain modals
  const AddOrderModal = KC.Orders?.AddOrderModal || KC.AddOrderModal;
  const EditOrderModal = KC.Orders?.EditOrderModal || KC.EditOrderModal;
  const DeleteOrderModal = KC.Orders?.DeleteOrderModal || KC.DeleteOrderModal;

  const AddVendorEntryModal = KC.Vendors?.AddVendorEntryModal || KC.AddVendorEntryModal;
  const RegisterVendorModal = KC.Vendors?.RegisterVendorModal || KC.RegisterVendorModal;
  const EditVendorModal = KC.Vendors?.EditVendorModal || KC.EditVendorModal;
  const VendorBillsModal = KC.Vendors?.VendorBillsModal || KC.VendorBillsModal;

  const AddCookModal = KC.Cooks?.AddCookModal || KC.AddCookModal;
  const EditCookModal = KC.Cooks?.EditCookModal || KC.EditCookModal;

  const CreateSheetModal = KC.Common?.CreateSheetModal || KC.CreateSheetModal;

  return {
    AddOrderModal,
    EditOrderModal,
    DeleteOrderModal,
    AddVendorEntryModal,
    RegisterVendorModal,
    EditVendorModal,
    VendorBillsModal,
    AddCookModal,
    EditCookModal,
    CreateSheetModal
  };
})();

// Re-export onto window.KitchenComponents root namespace for backward compatibility
Object.assign(window.KitchenComponents, window.KitchenComponents.Modals);
