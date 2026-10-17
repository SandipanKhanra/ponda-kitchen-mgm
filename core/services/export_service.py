"""
Export Service - SRP: Generates formatted Excel spreadsheet downloads.
DIP: Injected with IStorageBackend.
"""

import io
from typing import Optional
from core.interfaces import IExportService, IStorageBackend


class ExportService(IExportService):
    """Handles Excel export generation for month worksheets."""

    def __init__(self, storage: IStorageBackend):
        self.storage = storage

    def export_excel(self, tab_name: Optional[str] = None) -> io.BytesIO:
        """Returns in-memory Excel workbook stream for the given tab."""
        return self.storage.generate_excel_export(tab_name=tab_name)

