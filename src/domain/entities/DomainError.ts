export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'DOMAIN_ERROR'
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class InvalidParametersError extends DomainError {
  constructor(message: string) {
    super(message, 'InvalidParameters');
    this.name = 'InvalidParametersError';
  }
}

export class HolidayFetchError extends DomainError {
  constructor(message: string) {
    super(message, 'HolidayFetchError');
    this.name = 'HolidayFetchError';
  }
}
