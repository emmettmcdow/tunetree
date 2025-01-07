from PIL import Image
import argparse

def calculate_whiteness(r, g, b):
    """
    Calculate how close a color is to white (255, 255, 255).
    Returns a value between 0 and 1, where 1 is pure white.
    """
    return (r + g + b) / (255 * 3)

def process_image(input_path, output_path, use_white=False, whiteness_threshold=0.9):
    """
    Process an image to convert non-transparent pixels to black or white.
    Colors closer to white are made transparent first.
    
    Args:
        input_path (str): Path to input PNG file
        output_path (str): Path to save the processed PNG
        use_white (bool): If True, use white instead of black for non-transparent pixels
        whiteness_threshold (float): Threshold for converting colors to transparent (0-1)
    """
    # Open the image and convert to RGBA if it isn't already
    img = Image.open(input_path).convert('RGBA')
    
    # Get the pixel data
    pixels = img.load()
    width, height = img.size
    
    # Choose the fill color based on the flag
    fill_color = (255, 255, 255, 255) if use_white else (0, 0, 0, 255)
    
    # Process each pixel
    for x in range(width):
        for y in range(height):
            # Get current pixel
            r, g, b, a = pixels[x, y]
            
            # If pixel is already transparent, skip it
            if a == 0:
                continue
                
            # Calculate how close the color is to white
            whiteness = calculate_whiteness(r, g, b)
            
            # If color is closer to white than threshold, make it transparent
            if whiteness > whiteness_threshold:
                pixels[x, y] = (255, 255, 255, 0)  # Completely transparent
            else:
                pixels[x, y] = fill_color
    
    # Save the processed image
    img.save(output_path, 'PNG')

def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(description='Convert non-transparent pixels in a PNG to black or white')
    parser.add_argument('input', help='Input PNG file path')
    parser.add_argument('output', help='Output PNG file path')
    parser.add_argument('--white', action='store_true', help='Use white instead of black')
    parser.add_argument('--threshold', type=float, default=0.9,
                      help='Whiteness threshold (0-1) for transparency conversion')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Process the image
    try:
        process_image(args.input, args.output, args.white, args.threshold)
        print(f"Successfully processed {args.input} and saved to {args.output}")
    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    main()
