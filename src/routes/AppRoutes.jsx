import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Search from "../pages/Search";
import Home from "../pages/Home";
import Explore from "../pages/Explore";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Editor from "../pages/Editor";
import Bookmarks from "../pages/Bookmarks";
import Drafts from "../pages/Drafts";
import Settings from "../pages/Settings";
import NotFound from "../pages/NotFound";
import StoryDetail from "../pages/StoryDetail";
import StoryPreview from "../pages/StoryPreview";
import StoryChapters from "../pages/StoryChapters";
import ChapterRead from "../pages/ChapterRead";
import ProtectedRoute from "./ProtectedRoute";


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/explore" element={<MainLayout><Explore /></MainLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:id" element={<MainLayout><Profile /></MainLayout>} />
        <Route path="/search" element={<MainLayout><Search /></MainLayout>} />

        {/* Story routes - specific first */}
        <Route path="/story/:id/chapters" element={<MainLayout><StoryChapters /></MainLayout>} />
        <Route path="/story/:id/chapter/:chapterId" element={<MainLayout><ChapterRead /></MainLayout>} />
        <Route path="/story/:id/read" element={<MainLayout><StoryDetail /></MainLayout>} />
        <Route path="/story/:id" element={<MainLayout><StoryPreview /></MainLayout>} />

        <Route path="/editor/:id" element={
          <ProtectedRoute><MainLayout><Editor /></MainLayout></ProtectedRoute>
        }/>
        <Route path="/editor" element={
          <ProtectedRoute><MainLayout><Editor /></MainLayout></ProtectedRoute>
        }/>
        <Route path="/dashboard" element={
          <ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>
        }/>
        <Route path="/bookmarks" element={
          <ProtectedRoute><MainLayout><Bookmarks /></MainLayout></ProtectedRoute>
        }/>
        <Route path="/drafts" element={
          <ProtectedRoute><MainLayout><Drafts /></MainLayout></ProtectedRoute>
        }/>
        <Route path="/settings" element={
          <ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>
        }/>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;