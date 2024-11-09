export default class ShaderCanvas {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private fragmentShader: string;
  private program: WebGLProgram | null;
  private uniforms: { [key: string]: WebGLUniformLocation | null };
  private attributes: { [key: string]: number };

  constructor(canvas: HTMLCanvasElement, fragmentShader: string) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      throw new Error('WebGL not supported');
    }
    this.gl = gl as WebGLRenderingContext;
    this.fragmentShader = fragmentShader;
    this.program = null;
    this.uniforms = {};
    this.attributes = {};
    this.init();
  }

  private init(): void {
    const vertexShader = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    this.program = this.createProgram(vertexShader, this.fragmentShader);
    if (!this.program) {
      throw new Error('Failed to create WebGL program');
    }
    this.gl.useProgram(this.program);

    // Set up a rectangle to draw on
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), this.gl.STATIC_DRAW);

    // Set up attributes and uniforms
    this.attributes.position = this.gl.getAttribLocation(this.program, 'a_position');
    this.gl.enableVertexAttribArray(this.attributes.position);
    this.gl.vertexAttribPointer(this.attributes.position, 2, this.gl.FLOAT, false, 0, 0);

    this.uniforms.resolution = this.gl.getUniformLocation(this.program, 'iResolution');
    this.uniforms.time = this.gl.getUniformLocation(this.program, 'iTime');
    this.uniforms.mouse = this.gl.getUniformLocation(this.program, 'iMouse');
  }

  private createShader(type: number, source: string): WebGLShader | null {
    const shader = this.gl.createShader(type);
    if (!shader) {
      console.error('Failed to create shader');
      return null;
    }
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram | null {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) {
      return null;
    }
    const program = this.gl.createProgram();
    if (!program) {
      return null;
    }
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program link error:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  public render(time: number): void {
    if (!this.program) return;
    this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    this.gl.uniform1f(this.uniforms.time, time * 0.001); // Convert to seconds
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
}

const prefix = `
precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
`
const suffix = `
void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
`
const bubbles = `
float opSmoothUnion( float d1, float d2, float k )
{
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
} 

float map(vec3 p)
{
	float d = 2.0;
	for (int i = 0; i < 16; i++) {
		float fi = float(i);
		float time = iTime * (fract(fi * 412.531 + 0.513) - 0.5) * 2.0;
		d = opSmoothUnion(
            sdSphere(p + sin(time + fi * vec3(52.5126, 64.62744, 632.25)) * vec3(2.0, 2.0, 0.8), mix(0.5, 1.0, fract(fi * 412.531 + 0.5124))),
			d,
			0.4
		);
	}
	return d;
}

vec3 calcNormal( in vec3 p )
{
    const float h = 1e-5; // or some other value
    const vec2 k = vec2(1,-1);
    return normalize( k.xyy*map( p + k.xyy*h ) + 
                      k.yyx*map( p + k.yyx*h ) + 
                      k.yxy*map( p + k.yxy*h ) + 
                      k.xxx*map( p + k.xxx*h ) );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    
    // screen size is 6m x 6m
	vec3 rayOri = vec3((uv - 0.5) * vec2(iResolution.x/iResolution.y, 1.0) * 6.0, 3.0);
	vec3 rayDir = vec3(0.0, 0.0, -1.0);
	
	float depth = 0.0;
	vec3 p;
	
	for(int i = 0; i < 64; i++) {
		p = rayOri + rayDir * depth;
		float dist = map(p);
        depth += dist;
		if (dist < 1e-6) {
			break;
		}
	}
	
    depth = min(6.0, depth);
	vec3 n = calcNormal(p);
    float b = max(0.0, dot(n, vec3(0.577)));
    vec3 col = (0.5 + 0.5 * cos((b + iTime * 3.0) + uv.xyx * 2.0 + vec3(0,2,4))) * (0.85 + b * 0.35);
    col *= exp( -depth * 0.15 );
	
    // maximum thickness is 2m in alpha channel
    fragColor = vec4(col, 1.0 - (depth - 0.5) / 2.0);
}

/** SHADERDATA
{
	"title": "My Shader 0",
	"description": "Lorem ipsum dolor",
	"model": "person"
}
*/
`

const wormhole =`
/////////////////////////////////////////////////
//                                             //
//                 CONSTANTS                   //
//                                             //
/////////////////////////////////////////////////
#define PI 3.14
#define TA 6.28
#define PH 1.57

/////////////////////////////////////////////////
//                                             //
//              NOISE GENERATION               //
//                                             //
/////////////////////////////////////////////////

// 2D value noise
float noisev(vec2 p)
{
    return fract(sin(p.x * 1234.0 + p.y * 2413.0) * 5647.0);
}

// Smoother noise
float noise(vec2 uv)
{
    // Noise vector
    vec2 nv = vec2(0.0);
    
    // Local positions
    vec2 lv = fract(uv);
    vec2 id = floor(uv);
    
    // Interpolate lv
    lv = lv * lv * (3.0 - 2.0 * lv);
    
    // Calculate each corner
    float bl = noisev(id);
    float br = noisev(id + vec2(1, 0));
    float tl = noisev(id + vec2(0, 1));
    float tr = noisev(id + vec2(1, 1));
    
    // Interpolate values
    float b = mix(bl, br, lv.x);
    float t = mix(tl, tr, lv.x);
    float n = mix(b, t, lv.y);
    
    // Return n
    return n;
}

// FBM function
float fbm(vec2 p)
{
    float f = 0.0;
    f += 0.5000 * noise(p); p *= 2.01;
    f += 0.2500 * noise(p+vec2(0.0, 1.0)); p *= 2.02;
    f += 0.1250 * noise(p+vec2(1.0, 0.0)); p *= 2.03;
    f += 0.0625 * noise(p+vec2(1.0, 1.0)); p *= 2.04;
    f /= 0.9375;
    return f;
}

/////////////////////////////////////////////////
//                                             //
//             HYPERSPACE EFFECT               //
//                                             //
/////////////////////////////////////////////////

// Calculates the hyperspace tunnel at uv
vec3 tunnel(vec2 uv)
{
    // Setup colour
    vec3 col = vec3(0.0);
    
    // Calculate polar co-ordinates
    float r = 0.5 / length(uv) + iTime;
    float mr = mod(r + 1000.0, 700.0);
    if (mr < 400.0)
        mr += 400.0;
    float theta = atan(uv.x, uv.y);
    
    // Calculate the colour
    // Convert the new polar co-ordinates to cartesian
    vec2 ptc = vec2(mr * cos(theta / TA), mr * sin(theta / TA));
    
    // Then create some noise
    float snv = fbm(ptc * 2.0);
    if (snv > 0.8)
        col = vec3(1.0);
    
    // Then make the tunnel. Use two noise values,
    // which are mirrors of each other. Use a small
    // value added to theta to prevent artifacts.
    float fbm1 = fbm(vec2( r, mod(theta + 0.001, PI) ));
    float fbm2 = fbm(vec2( r, PI - mod(theta - 0.001, PI) ));
    
    // Change fbm1 and fbm2 to make more contrast
    fbm1 = pow(fbm1, 2.0);
    fbm2 = pow(fbm2, 2.0);
    
    // More mirrored noise for colouring
    float fbm3 = fbm(vec2( r, mod(theta + 0.001, PI) ) * 2.0);
    float fbm4 = fbm(vec2( r, PI - mod(theta - 0.001, PI) ) * 2.0);
    
    // Colours for the tunnel
    vec3 tc1 = REPLACEME;
    vec3 tc2 = REPLACEME;
    
    // Set the noise value based on the angle
    if (theta > 0.0)
    	col = mix(col, mix(tc1, tc2, fbm4), fbm2);
    else
        col = mix(col, mix(tc1, tc2, fbm3), fbm1);
    
    // Return colour
    return col;
}

// Calculates the pixel at uv
vec3 calcPixel(vec2 uv)
{
    // Correct the UV co-ordinates
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;
    
    // Setup colour
    vec3 col = vec3(0.0);
    
    // Draw the tunnel
    col = tunnel(uv);
    
    // Return colour
    return col;
}

/////////////////////////////////////////////////
//                                             //
//              IMAGE PROCESSING               //
//                                             //
/////////////////////////////////////////////////
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Setup colour
    vec3 col = vec3(0.0);
    
    // Do some supersampling
    for (float x = -1.0; x < 2.0; x += 0.5)
    {
        for (float y = -1.0; y < 2.0; y += 0.5)
        {
            // Calculate pixel here
            vec3 pixel = calcPixel((fragCoord + vec2(x, y)) / iResolution.xy);
            
            // Add it, and make a bloom effect
            col += pixel;
        }
    }
    
    // Average it out
    col /= 16.0;
    
    // Output to screen
    fragColor = vec4(col,1.0);
}
`

export const shader = prefix + wormhole + suffix
