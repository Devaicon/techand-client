import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
 
// Image metadata
export const alt = 'Tech& - Enterprise Automation Solutions';
export const size = {
  width: 1200,
  height: 627,
};
 
export const contentType = 'image/png';
 
// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #2B3352, #5B6FB6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <h1
          style={{
            fontSize: '80px',
            fontWeight: 'bold',
            marginBottom: '20px',
            textAlign: 'center',
            padding: '0 40px',
          }}
        >
          Tech&
        </h1>
        <p
          style={{
            fontSize: '40px',
            color: '#e2e8f0',
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          Enterprise Automation & Digital Transformation Solutions
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
