# Website follow-ups

## Local and VPS information-flow views

Requested by the owner on 2026-10-26. **Deferred this round:** keep the current
`#how` diagram unchanged.

Add a view switch to the information-flow section later:

- Local deployment: show the Agent/client, local STU-MCP service, authenticated
  sources and the response path.
- VPS/server deployment: show the remote service boundary, client-to-server
  transport, source access and the return path.

Before implementing, verify the project's actual supported deployment and
transport modes, authentication boundaries, and where credentials/cache live.
Use those verified paths for the diagram; do not imply remote account access
or transport features that have not been implemented. Preserve both views in
the same section with a clear accessible switch.

This records a product request, not a completed feature or deployment.
