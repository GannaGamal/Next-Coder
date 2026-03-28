
import * as React from "react";
import { RouteObject } from "react-router-dom";
import { lazy } from "react";

const HomePage = lazy(() => import("../pages/home/page"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const FreelancerProfile = lazy(() => import("../pages/profile/FreelancerProfile"));
const ClientProfile = lazy(() => import("../pages/profile/ClientProfile"));
const EmployerProfile = lazy(() => import("../pages/profile/EmployerProfile"));
const ApplicantProfile = lazy(() => import("../pages/profile/ApplicantProfile"));
const LearnerProfile = lazy(() => import("../pages/profile/LearnerProfile"));
const PublicCVs = lazy(() => import("../pages/cvs/PublicCVs"));
const CVDetail = lazy(() => import("../pages/cvs/CVDetail"));
const Portfolios = lazy(() => import("../pages/portfolios/Portfolios"));
const PortfolioDetail = lazy(() => import("../pages/portfolios/PortfolioDetail"));
const JobOffers = lazy(() => import("../pages/jobs/JobOffers"));
const JobApplication = lazy(() => import("../pages/jobs/JobApplication"));
const FreelanceMarketplace = lazy(() => import("../pages/marketplace/FreelanceMarketplace"));
const ProjectDetail = lazy(() => import("../pages/marketplace/ProjectDetail"));
const Roadmaps = lazy(() => import("../pages/roadmaps/Roadmaps"));
const CourseDetail = lazy(() => import("../pages/roadmaps/CourseDetail"));
const TrackRecommendation = lazy(() => import("../pages/roadmaps/TrackRecommendation"));
const Achievements = lazy(() => import("../pages/roadmaps/Achievements"));
const TrackLearning = lazy(() => import("../pages/roadmaps/TrackLearning"));
const AboutUs = lazy(() => import("../pages/about/AboutUs"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const SearchResults = lazy(() => import("../pages/search/SearchResults"));
const RateUs = lazy(() => import("../pages/rate/RateUs"));
const PublicProfile = lazy(() => import("../pages/profile/PublicProfile"));
const NotFound = lazy(() => import("../pages/NotFound"));
const NotificationsPage = lazy(() => import("../pages/notifications/NotificationsPage"));
const Settings = lazy(() => import("../pages/settings/Settings"));
import Contact from "../pages/contact/Contact";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/profile/freelancer",
    element: <FreelancerProfile />,
  },
  {
    path: "/profile/client",
    element: <ClientProfile />,
  },
  {
    path: "/profile/employer",
    element: <EmployerProfile />,
  },
  {
    path: "/profile/job-seeker",
    element: <ApplicantProfile />,
  },
  {
    path: "/profile/learner",
    element: <LearnerProfile />,
  },
  {
    path: "/cvs",
    element: <PublicCVs />,
  },
  {
    path: "/cv/:cvId",
    element: <CVDetail />,
  },
  {
    path: "/portfolios",
    element: <Portfolios />,
  },
  {
    path: "/portfolio/:portfolioId",
    element: <PortfolioDetail />,
  },
  {
    path: "/jobs",
    element: <JobOffers />,
  },
  {
    path: "/job/:jobId",
    element: <JobApplication />,
  },
  {
    path: "/marketplace",
    element: <FreelanceMarketplace />,
  },
  {
    path: "/marketplace/:projectId",
    element: <ProjectDetail />,
  },
  {
    path: "/roadmaps",
    element: <Roadmaps />,
  },
  {
    path: "/roadmaps/recommendation",
    element: <TrackRecommendation />,
  },
  {
    path: "/roadmaps/achievements",
    element: <Achievements />,
  },
  {
    path: "/roadmaps/learn/:trackName",
    element: <TrackLearning />,
  },
  {
    path: "/roadmaps/:courseId",
    element: <CourseDetail />,
  },
  {
    path: "/about",
    element: <AboutUs />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/rate-us",
    element: <RateUs />,
  },
  {
    path: "/search",
    element: <SearchResults />,
  },
  {
    path: "/user/:userId",
    element: <PublicProfile />,
  },
  {
    path: "/notifications",
    element: <NotificationsPage />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
