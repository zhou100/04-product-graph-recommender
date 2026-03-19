"""Pure normalization functions for product data."""

from __future__ import annotations

import re

BRAND_ALIASES: dict[str, str] = {
    "hewlett-packard": "HP",
    "hewlett packard": "HP",
    "hp inc": "HP",
    "microsoft corporation": "Microsoft",
    "microsoft corp": "Microsoft",
    "apple computer": "Apple",
    "apple inc": "Apple",
    "computer associates": "CA Technologies",
    "ibm corporation": "IBM",
}

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "Software": ["software", "windows", "office", "antivirus", "quickbooks", "photoshop", "acrobat"],
    "Networking": ["router", "switch", "modem", "wireless", "wifi", "ethernet", "network"],
    "Storage": ["hard drive", "ssd", "flash drive", "usb drive", "memory card", "storage"],
    "Audio": ["speaker", "headphone", "headset", "microphone", "audio", "sound card"],
    "Printers": ["printer", "ink", "toner", "cartridge", "scanner"],
    "Input Devices": ["keyboard", "mouse", "trackball", "gamepad", "joystick"],
    "Monitors": ["monitor", "display", "lcd", "led display"],
    "Laptops & Computers": ["laptop", "notebook", "desktop", "computer", "pc"],
    "Cameras & Video": ["camera", "camcorder", "webcam", "video"],
    "Games": ["game", "playstation", "xbox", "nintendo", "gaming"],
    "Memory & CPUs": ["ram", "ddr", "processor", "cpu", "memory module"],
}


def normalize_title(title: str | None) -> str:
    if not title:
        return ""
    text = re.sub(r"\s+", " ", title.strip())
    return text


def normalize_brand(manufacturer: str | None) -> str | None:
    if not manufacturer or not manufacturer.strip():
        return None
    brand = manufacturer.strip().lower()
    if brand in BRAND_ALIASES:
        return BRAND_ALIASES[brand]
    return manufacturer.strip().title()


def normalize_price(price: float | str | None) -> float | None:
    if price is None:
        return None
    try:
        val = float(str(price).replace("$", "").replace(",", "").strip())
        return val if val > 0 else None
    except (ValueError, TypeError):
        return None


def infer_category(title: str) -> str:
    lower = title.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return category
    return "Other"
