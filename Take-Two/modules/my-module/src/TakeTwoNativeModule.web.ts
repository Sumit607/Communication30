import { registerWebModule, NativeModule } from 'expo';

class TakeTwoNativeModule extends NativeModule<{}> {}

export default registerWebModule(TakeTwoNativeModule, 'TakeTwoNativeModule');
