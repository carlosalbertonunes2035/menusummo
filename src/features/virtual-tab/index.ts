/**
 * Feature: Virtual Tab
 * Architecture: Feature-Sliced Design (Internal Structure)
 */

// UI - Presentational components categorized by actor
export * from './ui/Client/PublicTableMenu'; // Main Page (Re-exported for convenience)
export * from './ui/Client/QuickRegistration';
export * from './ui/Client/TableMenu';
export * from './ui/Client/TableActions';
export * from './ui/Client/TableCart';
export * from './ui/Client/CheckoutOptions';
export * from './ui/Client/CallWaiterButton';
export * from './ui/Client/PaymentOptions';

export * from './ui/Waiter/WaiterOrderAlert';
export * from './ui/Waiter/OrderClaimCard';
export * from './ui/Waiter/WaiterRequestsList';
export * from './ui/Waiter/MyTables';
export * from './ui/Waiter/AvailabilityToggle';

export * from './ui/Admin/QRCodeGenerator';
export * from './ui/Admin/QRCodeManager';
export * from './ui/Admin/OperationSettingsForm';
export * from './ui/Admin/LossDashboard';

export * from './ui/Shared/ErrorBoundary';
export * from './ui/Shared/LoadingStates';

// Pages
export { TableSessionPage } from './ui/Admin/Pages/TableSessionPage';
export { WaiterDashboard } from './ui/Waiter/Pages/WaiterDashboard';
export { WaiterTableOrder } from './ui/Waiter/Pages/WaiterTableOrder';
export { PublicTableMenu } from './ui/Client/PublicTableMenu';

// Model - Business logic, state and types
export * from './model/hooks/useTableSession';
export * from './model/hooks/useOrderClaim';
export * from './model/hooks/useWaiterRequest';
export * from './model/hooks/useWaiterStatus';
export * from './model/hooks/useLossTracking';
export * from './model/hooks/useConfig';
export * from './model/hooks/useNotifications';

// Lib - Helpers and Utils
export * from './lib/utils/claimUtils';

// Constants & Types
export * from './constants';
export * from './model/types';
