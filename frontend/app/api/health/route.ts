/**
 * app/api/health/route.ts
 * Next.js API route — health check for the frontend.
 * Used by Docker healthcheck and monitoring tools.
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status:  'ok',
    app:     'Lumi Frontend',
    version: process.env.npm_package_version ?? '0.1.0',
    time:    new Date().toISOString(),
  })
}
