import https from 'https';
import fs from 'fs';
import path from 'path';

const API_URL = 'https://wiki.bloodontheclocktower.com/api.php?action=query&list=allimages&ailimit=max&format=json';

interface ImageData {
  name: string;
  timestamp: string;
  url: string;
  descriptionurl: string;
  descriptionshorturl: string;
  ns: number;
  title: string;
}

interface ApiResponse {
  batchcomplete: string;
  limits: {
    allimages: number;
  };
  query: {
    allimages: ImageData[];
  };
}

interface ImageMap {
  [key: string]: string;
}

function fetchImages(): void {
  https.get(API_URL, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response: ApiResponse = JSON.parse(data);
        const images = response.query.allimages;

        const imageMap: ImageMap = {};
        images
          .filter(img => img.name.startsWith('Icon_'))
          .forEach(img => {
            const key = img.name.replace('Icon_', '').replace(/\.(png|jpg|jpeg|gif|svg)$/i, '').toLowerCase();
            imageMap[key] = img.url;
          });

        const outputDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, 'images.json');
        fs.writeFileSync(outputPath, JSON.stringify(imageMap, null, 2));
        console.log(`Successfully saved ${Object.keys(imageMap).length} images to ${outputPath}`);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });
  }).on('error', (error) => {
    console.error('Error fetching data:', error);
  });
}

fetchImages();
