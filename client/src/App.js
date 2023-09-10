import React, {useEffect, useState} from 'react'

function App(){
  
  const [backendData, setBackendData] = useState([{}])

  useEffect(() => {
    fetch("/api/city-separation-distance?distance=142.2").then(
      response => response.json()
    ).then(
      data => {
        setBackendData(data)
      }
    )
  }, [])

  return (
    <div>

    </div>
  )
}


export default App