/// <reference types="expo/types" />

declare module 'expo-image' {
  import { ComponentType } from 'react';
  import { ImageProps } from 'react-native';
  export const Image: ComponentType<any>;
  export default Image;
}

declare module '*.module.css' {
  const content: { [className: string]: string };
  export default content;
}
