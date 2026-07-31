import type { CustomMarkerIcon } from "./customMarkers";

export function MapMarkerIcon({ icon }: { icon: CustomMarkerIcon }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {renderIcon(icon)}
    </svg>
  );
}

function renderIcon(icon: CustomMarkerIcon) {
  switch (icon) {
    case "home":
      return <><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>;
    case "shop":
      return <><path d="M4 9h16l-2-5H6L4 9Z" /><path d="M5 9v11h14V9M8 13h8M9 20v-7" /></>;
    case "garage":
      return <><path d="m3 10 9-6 9 6v10H3V10Z" /><path d="M6 20v-7h12v7M8 16h8" /></>;
    case "fuel":
      return <><path d="M5 21V4h10v17M4 21h12M8 8h4" /><path d="m15 7 3 3v7a2 2 0 0 0 4 0v-5l-2-2" /></>;
    case "hospital":
      return <><path d="M4 4h16v16H4z" /><path d="M12 7v10M7 12h10" /></>;
    case "police":
      return <><path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Z" /><path d="m12 7 1.2 2.4 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4L12 7Z" /></>;
    case "bank":
      return <><path d="m3 9 9-5 9 5H3ZM5 19h14M3 22h18M7 9v10M12 9v10M17 9v10" /></>;
    case "cannabis":
      return <><path d="M12 21v-8M12 14 8 8l4 2V3l2 7 4-2-4 6 5-1-7 5-7-5 5 1-4-6 4 2 2-7" /></>;
    case "weapon":
      return <><path d="M3 8h12l5 3-4 3h-5l-1 6H7l1-6H3V8Z" /><path d="M15 8V5h3v5" /></>;
    case "package":
      return <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7M12 11v10" /></>;
    case "mask":
      return <><path d="M3 9c3-3 15-3 18 0l-2 8c-2 3-5 2-7-1-2 3-5 4-7 1L3 9Z" /><path d="M7 11h3M14 11h3" /></>;
    default:
      return <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>;
  }
}
