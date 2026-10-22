import { Route, Routes } from 'react-router-dom';
import PageLayout from './components/PageLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';

export default function App() {
  return (
    <PageLayout>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<ProjectsPage />} path="/projects" />
        <Route element={<ProjectDetailPage />} path="/projects/:slug" />
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </PageLayout>
  );
}
