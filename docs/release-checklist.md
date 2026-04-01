# Release Checklist

## Security

- [ ] `APP_API_KEY` configured in target environment
- [ ] `APP_DATA_KEY` configured and rotated policy documented
- [ ] Sensitive fields are masked in API responses
- [ ] Dependency vulnerability scan passed

## Quality

- [ ] `mvn -q test` passed
- [ ] `pnpm --filter web-portal build` passed
- [ ] `pnpm smoke` passed
- [ ] `pnpm e2e:smoke` passed

## Operations

- [ ] Database migration backup/rollback plan prepared
- [ ] Monitoring and alerting dashboard available
- [ ] Log retention and audit retention confirmed

## Deployment

- [ ] CI checks green on main
- [ ] Tag and release note prepared
- [ ] Post-deploy health check complete
