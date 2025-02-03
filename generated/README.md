# OCSF TypeScript Types

TypeScript type definitions for the Open Cybersecurity Schema Framework (OCSF).

## Installation

```bash
npm install ocsf-types
```

## Usage

Import the types you need:

```typescript
import { Device, Network, User } from 'ocsf-types';

// Example usage with a device object
const device: Device = {
    id: "device-123",
    type: "workstation",
    name: "DESKTOP-ABC123",
    // ... other properties
};
```

## Available Types

### Objects
- Account
- Actor
- Advisory
- Agent
- Attack
- Certificate
- Cloud
- Container
- Device
- Email
- File
- Network
- Process
- User
- And many more...

### Base Types
- boolean_t
- datetime_t
- email_t
- file_hash_t
- hostname_t
- ip_t
- mac_t
- port_t
- string_t
- timestamp_t
- url_t
- uuid_t

## Known Limitations

- There is a type incompatibility in device.ts where OCSFDevice.name is optional but extends from OCSFEndpoint where name is required. This reflects the current state of the OCSF schema.

## Contributing

This package contains automatically generated types from the OCSF schema. If you find issues with the types, please report them at the [generator repository](https://github.com/newpush/ocsf-typescript-generator).

## License

MIT
