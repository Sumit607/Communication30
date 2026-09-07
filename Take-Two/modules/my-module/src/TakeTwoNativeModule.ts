import { NativeModule, requireNativeModule } from 'expo';

declare class TakeTwoNativeModule extends NativeModule<{}> {}

export default requireNativeModule<TakeTwoNativeModule>('TakeTwoNative');
