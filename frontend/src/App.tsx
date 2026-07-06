import { AppProviders } from './shared/providers/AppProviders';
import { AppRoutes } from './router';

export default function App(): React.JSX.Element {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
