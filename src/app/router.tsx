import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
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
import { Assistant } from '../pages/Assistant';
import { Reports } from '../pages/Reports';
import { Audit } from '../pages/Audit';
import { Providers } from './providers';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Providers>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="mps" element={<MembersOfParliament />} />
            <Route path="projects" element={<Projects />} />
            <Route path="risk-analysis" element={<RiskAnalysis />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="financial" element={<FinancialAnalytics />} />
            <Route path="project-execution" element={<ProjectExecution />} />
            <Route path="districts" element={<Districts />} />
            <Route path="agencies" element={<Agencies />} />
            <Route path="geographic" element={<Geographic />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="reports" element={<Reports />} />
            <Route path="audit" element={<Audit />} />
          </Route>
        </Routes>
      </Providers>
    </BrowserRouter>
  );
}
