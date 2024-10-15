package main

import (
	"fmt"
	"image"
	"image/jpeg"
	"net/http"
	"slices"

	"github.com/lucasb-eyer/go-colorful"
)

func getColorPalette(imageURL string) (paletteColors []string) {
	// Download the image
	resp, err := http.Get(imageURL)
	if err != nil {
		fmt.Println("Error downloading image:", err)
		return
	}
	defer resp.Body.Close()

	// Decode the image
	img, err := jpeg.Decode(resp.Body)
	if err != nil {
		fmt.Println("Error decoding image:", err)
		return
	}

	// Generate palette using k-means clustering
	pixels := getPixels(img)
	palette := generatePalette(pixels)

	// Print the palette
	for _, color := range palette {
		paletteColors = append(paletteColors, fmt.Sprintf("#%02X%02X%02X", uint8(color.R*255), uint8(color.G*255), uint8(color.B*255)))
	}
	return paletteColors
}

func generatePalette(pixels []colorful.Color) (colors []colorful.Color) {
	// Sort by hue
	slices.SortFunc(pixels, func(a, b colorful.Color) int {
		ha, _, _ := a.Hsl()
		hb, _, _ := b.Hsl()
		if ha > hb {
			return 1
		} else {
			return -1
		}
	})

	const THRESHOLD = 30
	// Thin out the colors by removing similar colors
	colors = []colorful.Color{pixels[0]}
	lastHue, _, _ := colors[0].Hsl()
	for _, pixel := range pixels[1:] {
		thisHue, _, _ := pixel.Hsl()
		if thisHue-lastHue > THRESHOLD {
			colors = append(colors, pixel)
			lastHue = thisHue
		}
	}
	fmt.Println(len(colors))
	return colors
}

func max(pixelCount []int) (mi int) {
	mc := pixelCount[0]
	for i, c := range pixelCount {
		if c > mc {
			mi = i
			mc = c
		}
	}
	return mi
}

func getPixels(img image.Image) []colorful.Color {
	bounds := img.Bounds()
	var pixels []colorful.Color

	// Extract pixels
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			r, g, b, _ := img.At(x, y).RGBA()
			pixels = append(pixels, colorful.Color{R: float64(r) / 65535, G: float64(g) / 65535, B: float64(b) / 65535})
		}
	}
	return pixels
}
