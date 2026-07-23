import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppHeader } from "../components/AppHeader";

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

export function AppRoutes() {
  return (
    <>
      <AppHeader />
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/viewer" element={<ViewerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

function PageLoading() {
  return <div className="page-loading">Loading FiveMesh...</div>;
}
