export async function spotifyGetArt(albumId: string){
  const params = new URLSearchParams()
  params.append("albumId", albumId)
  const url = process.env.REACT_APP_API_URL + `external/albums?${params.toString()}`

  let result = null;
  try{
    const response = await fetch(url, {
          method: "GET",
    });

    if (response.ok) {
      result = await response.json()
    } else {
      console.error(response.body)
      return ["", ""]
    }
  } catch(error) {
    console.error(error)
    return ["", ""]
  }
  let imageUrl = "";
  let name = '';
  try{  
    imageUrl = result['albums'][0]['images'][0]['url'];
    name = result['albums'][0]['name']
  } catch(error) {
    console.error(error)
  }
  console.log(imageUrl);
  return [imageUrl, name];
}

export async function spotifySearch(term: string, type: string) {
  // Type: album, artist, track
  const params = new URLSearchParams()
  params.append("term", term)
  params.append("type", type)
  const url = process.env.REACT_APP_API_URL + `external/search?${params.toString()}`

  let result = null;
  try{
    const response = await fetch(url, {
          method: "GET"
    });

    if (response.ok) {
      result = await response.json()
    } else {
      console.error(response.body)
      return ""
    }
  } catch(error) {
    console.error(error)
    return ""
  }

  try{  
    let userId = result['artists']['items'][0]['id']
    let spotArtistName = result['artists']['items'][0]['name']
    if (userId && term == spotArtistName) {
      return userId;
    }
  } catch(error) {
    console.error(error)
  }
  return "";

}
