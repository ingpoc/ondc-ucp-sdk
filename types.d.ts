// Global type declarations for internal packages
// These allow the website apps to import from @ondc-website/shared without type errors

declare module '@ondc-website/shared' {
  export * from '@ondc-agent/shared';
  export * from '@ondc-website/shared/hooks';
  export * from '@ondc-website/shared/components';
}

declare module '@ondc-website/shared/hooks' {
  export * from './packages/website/shared/src/hooks';
}

declare module '@ondc-website/shared/components' {
  export * from './packages/website/shared/src/components';
}

declare module '@ondc-website/shared/design-system' {
  export * from '@ondc-agent/shared/design-system';
}
