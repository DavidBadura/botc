import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function GET() {
    const browser = await puppeteer.launch({
        headless: true,
    })

    try {
        const page = await browser.newPage()
        await page.goto('http://localhost:3000/', {
            waitUntil: 'networkidle2',
        })

        await page.emulateMediaType('screen')

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            waitForFonts: true,
            scale: 1,
        })

        return new NextResponse(pdf, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="invoice.pdf"',
            },
        })
    } finally {
        await browser.close()
    }
}