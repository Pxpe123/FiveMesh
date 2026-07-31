import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppHeader } from "../components/AppHeader";
import { BackendStatusBanner } from "../components/BackendStatusBanner";

const HomeScreen = lazy(() =>
  import("../features/home/HomeScreen").then((module) => ({
    default: module.HomeScreen,
  })),
);
const ViewerPage = lazy(() =>
  import("../features/model-viewer/ViewerPage").then((module) => ({
    default: module.ViewerPage,
  })),
);
const ConverterPage = lazy(() =>
  import("../features/conversion/ConverterPage").then((module) => ({
    default: module.ConverterPage,
  })),
);
const MloPage = lazy(() =>
  import("../features/mlo/MloPage").then((module) => ({
    default: module.MloPage,
  })),
);
const HackPracticePage = lazy(() =>
  import("../features/hack-practice/HackPracticePage").then((module) => ({
    default: module.HackPracticePage,
  })),
);
const MapPage = lazy(() =>
  import("../features/map/MapPage").then((module) => ({
    default: module.MapPage,
  })),
);

export function AppRoutes() {
  return (
    <>
      <AppHeader />
      <BackendStatusBanner />
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/viewer" element={<ViewerPage />} />
          <Route path="/converter" element={<ConverterPage />} />
          <Route path="/mlo" element={<MloPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/games/hack-practice" element={<HackPracticePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

function PageLoading() {
  return <div className="page-loading">Loading FiveMesh...</div>;
}
