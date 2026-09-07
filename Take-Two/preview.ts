import { registerRootComponent } from 'expo';
import PreviewApp from './src/features/preview/preview-app';

// UI review only. The production router and device services are deliberately not loaded.
registerRootComponent(PreviewApp);
