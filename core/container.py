"""
Dependency Injection Container - DIP (Dependency Inversion Principle).
Acts as composition root, assembling domain services with their required dependencies.
"""

from typing import Optional
from core.interfaces import (
    IStorageBackend, IPolicyCalculator, IOrderService,
    IVendorService, ICookService, IExportService
)
from core.domain.policy import PolicyCalculator
from core.services.order_service import OrderService
from core.services.vendor_service import VendorService
from core.services.cook_service import CookService
from core.services.export_service import ExportService


class AppContainer:
    """
    Central Service Container / Composition Root.
    Assembles single-responsibility services with constructor-injected dependencies.
    """

    def __init__(self, storage_backend: Optional[IStorageBackend] = None):
        # 1. Initialize Storage Backend (or lazy-load default)
        if storage_backend is None:
            from core.storage.sheet_storage_backend import SheetStorageBackend
            self._storage: IStorageBackend = SheetStorageBackend()
        else:
            self._storage = storage_backend

        # 2. Initialize Policy Engine
        self._policy_service: IPolicyCalculator = PolicyCalculator()

        # 3. Initialize Domain Services with Injected Dependencies (DIP)
        self._order_service: IOrderService = OrderService(
            storage=self._storage,
            policy=self._policy_service
        )

        self._vendor_service: IVendorService = VendorService(
            storage=self._storage
        )

        self._cook_service: ICookService = CookService(
            storage=self._storage,
            policy=self._policy_service
        )

        self._export_service: IExportService = ExportService(
            storage=self._storage
        )

    @property
    def storage(self) -> IStorageBackend:
        return self._storage

    @property
    def policy_service(self) -> IPolicyCalculator:
        return self._policy_service

    @property
    def order_service(self) -> IOrderService:
        return self._order_service

    @property
    def vendor_service(self) -> IVendorService:
        return self._vendor_service

    @property
    def cook_service(self) -> ICookService:
        return self._cook_service

    @property
    def export_service(self) -> IExportService:
        return self._export_service


# Global Container Instance
container = AppContainer()

