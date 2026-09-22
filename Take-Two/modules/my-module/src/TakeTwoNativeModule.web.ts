import { registerWebModule, NativeModule } from 'expo';

class TakeTwoNativeModule extends NativeModule<Record<string, never>> {}

export default registerWebModule(TakeTwoNativeModule, 'TakeTwoNativeModule');
