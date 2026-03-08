import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ color: string }> }
) {
  try {
    const { color } = await params

    // Validate hex color (6 characters)
    if (!/^[0-9A-Fa-f]{6}$/.test(color)) {
      return new NextResponse('Invalid color format: ' + color, { status: 400 })
    }

    // Read the pattern image
    const patternPath = path.join(process.cwd(), 'public', 'assets', 'pattern.jpg')
    const patternBuffer = await readFile(patternPath)

    // Get image metadata
    const image = sharp(patternBuffer)
    const metadata = await image.metadata()

    // Create a solid color overlay with the same dimensions
    const colorOverlay = Buffer.from(
      `<svg width="${metadata.width}" height="${metadata.height}">
        <rect width="100%" height="100%" fill="#${color}"/>
      </svg>`
    )

    // Blend the images using multiply composite
    const result = await sharp(patternBuffer)
      .composite([{
        input: colorOverlay,
        blend: 'multiply'
      }])
      .jpeg({ quality: 90 })
      .toBuffer()

    return new NextResponse(result, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error generating pattern:', error)
    return new NextResponse('Error generating pattern', { status: 500 })
  }
}