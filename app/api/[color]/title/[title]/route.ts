import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import Color from 'color'
import satori from 'satori'
import sharp from 'sharp'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ color: string; title: string }> }
) {
  try {
    const { color, title } = await params
    const decodedTitle = decodeURIComponent(title)

    // Validate hex color (6 characters)
    if (!/^[0-9A-Fa-f]{6}$/.test(color)) {
      return new NextResponse('Invalid color format', { status: 400 })
    }

    // Create gradient colors
    const baseColor = Color(`#${color}`)
    const lighterColor = baseColor.lighten(0.8)

    // Read the font file
    const fontPath = path.join(process.cwd(), 'public', 'font', '46887ce1dc738fc2de8f66db681c14ee.ttf')
    const fontBuffer = await readFile(fontPath)

    // Generate SVG with satori
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 100,
            backgroundImage: `linear-gradient(to top right, ${baseColor.hex()}, ${lighterColor.hex()})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          },
          children: decodedTitle,
        },
      },
      {
        width: 800,
        height: 150,
        fonts: [
          {
            name: 'TitleFont',
            data: fontBuffer,
            weight: 400,
            style: 'normal',
          },
        ],
      }
    )

    // Convert SVG to PNG using sharp
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer()

    return new NextResponse(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error generating title image:', error)
    return new NextResponse('Error generating title image', { status: 500 })
  }
}
