package main

import (
	"fmt"
	"image"
	"image/jpeg"
	"math"
	"math/rand"
	"net/http"

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
	numColors := 5
	palette := generatePaletteKMeans(img, numColors)

	// Print the palette
	for _, color := range palette {
		paletteColors = append(paletteColors, fmt.Sprintf("#%02X%02X%02X", uint8(color.R*255), uint8(color.G*255), uint8(color.B*255)))
	}
	return paletteColors
}

func generatePaletteKMeans(img image.Image, k int) []colorful.Color {
	bounds := img.Bounds()
	var pixels []colorful.Color

	// Extract pixels
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			r, g, b, _ := img.At(x, y).RGBA()
			pixels = append(pixels, colorful.Color{R: float64(r) / 65535, G: float64(g) / 65535, B: float64(b) / 65535})
		}
	}

	// Initialize centroids randomly
	centroids := make([]colorful.Color, k)
	for i := range centroids {
		centroids[i] = pixels[rand.Intn(len(pixels))]
	}

	// Perform k-means clustering
	maxIterations := 50
	for iter := 0; iter < maxIterations; iter++ {
		clusters := make([][]colorful.Color, k)

		// Assign pixels to nearest centroid
		for _, pixel := range pixels {
			nearestCentroid := 0
			minDistance := math.Inf(1)
			for i, centroid := range centroids {
				distance := colorDistance(pixel, centroid)
				if distance < minDistance {
					minDistance = distance
					nearestCentroid = i
				}
			}
			clusters[nearestCentroid] = append(clusters[nearestCentroid], pixel)
		}

		// Update centroids
		moved := false
		for i, cluster := range clusters {
			if len(cluster) == 0 {
				continue
			}
			newCentroid := averageColor(cluster)
			if !newCentroid.AlmostEqualRgb(centroids[i]) {
				centroids[i] = newCentroid
				moved = true
			}
		}

		// If centroids didn't move, we've converged
		if !moved {
			break
		}
	}

	return centroids
}

func colorDistance(c1, c2 colorful.Color) float64 {
	return math.Pow(c1.R-c2.R, 2) + math.Pow(c1.G-c2.G, 2) + math.Pow(c1.B-c2.B, 2)
}

func averageColor(colors []colorful.Color) colorful.Color {
	var r, g, b float64
	for _, c := range colors {
		r += c.R
		g += c.G
		b += c.B
	}
	n := float64(len(colors))
	return colorful.Color{R: r / n, G: g / n, B: b / n}
}
