import { NativeModule, requireNativeModule } from 'expo';

declare class TakeTwoNativeModule extends NativeModule<Record<string, never>> {}

export default requireNativeModule<TakeTwoNativeModule>('TakeTwoNative');
