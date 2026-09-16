import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { RoleGuard } from '../components/auth/RoleGuard';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { MembersOfParliament } from '../pages/MembersOfParliament';
import { Projects } from '../pages/Projects';
import { RiskAnalysis } from '../pages/RiskAnalysis';
import { Alerts } from '../pages/Alerts';
import { Compliance } from '../pages/Compliance';
import { FinancialAnalytics } from '../pages/FinancialAnalytics';
import { ProjectExecution } from '../pages/ProjectExecution';
import { Districts } from '../pages/Districts';
import { Agencies } from '../pages/Agencies';
import { Geographic } from '../pages/Geographic';
import { AnalyticsHub } from '../pages/AnalyticsHub';
import { Assistant } from '../pages/Assistant';
import { Reports } from '../pages/Reports';
import { Audit } from '../pages/Audit';
import { Providers } from './providers';

import { Landing } from '../pages/Landing';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Providers>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="mps" element={<RoleGuard route="mps"><MembersOfParliament /></RoleGuard>} />
            <Route path="projects" element={<RoleGuard route="projects"><Projects /></RoleGuard>} />
            <Route path="risk-analysis" element={<RoleGuard route="risk-analysis"><RiskAnalysis /></RoleGuard>} />
            <Route path="alerts" element={<RoleGuard route="alerts"><Alerts /></RoleGuard>} />
            <Route path="compliance" element={<RoleGuard route="compliance"><Compliance /></RoleGuard>} />
            <Route path="analytics" element={<RoleGuard route="analytics"><AnalyticsHub /></RoleGuard>} />
            <Route path="financial" element={<RoleGuard route="financial"><FinancialAnalytics /></RoleGuard>} />
            <Route path="project-execution" element={<RoleGuard route="project-execution"><ProjectExecution /></RoleGuard>} />
            <Route path="districts" element={<RoleGuard route="districts"><Districts /></RoleGuard>} />
            <Route path="agencies" element={<RoleGuard route="agencies"><Agencies /></RoleGuard>} />
            <Route path="geographic" element={<RoleGuard route="geographic"><Geographic /></RoleGuard>} />
            <Route path="assistant" element={<RoleGuard route="assistant"><Assistant /></RoleGuard>} />
            <Route path="reports" element={<RoleGuard route="reports"><Reports /></RoleGuard>} />
            <Route path="audit" element={<RoleGuard route="audit"><Audit /></RoleGuard>} />
          </Route>
        </Routes>
      </Providers>
    </BrowserRouter>
  );
}
