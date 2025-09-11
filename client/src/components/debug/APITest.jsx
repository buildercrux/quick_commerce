/**
 * API Test Component - Debug API calls
 */

import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchProducts } from '../../features/products/productSlice'

const APITest = () => {
  const dispatch = useDispatch()
  const { products, isLoading, error } = useSelector((state) => state.products)
  const [apiResponse, setApiResponse] = useState(null)

  useEffect(() => {
    // Test direct API call
    const testAPI = async () => {
      try {
        const response = await fetch('/api/v1/products?limit=2')
        const data = await response.json()
        setApiResponse(data)
        console.log('Direct API Response:', data)
      } catch (error) {
        console.error('Direct API Error:', error)
      }
    }

    testAPI()
    
    // Test Redux action
    dispatch(fetchProducts({ limit: 2 }))
  }, [dispatch])

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">API Debug Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Direct API Response */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Direct API Response</h2>
          {apiResponse ? (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Status: {apiResponse.success ? 'Success' : 'Failed'}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Products Count: {apiResponse.data?.length || 0}
              </p>
              {apiResponse.data?.[0] && (
                <div className="mt-4">
                  <h3 className="font-medium">First Product:</h3>
                  <p className="text-sm">Name: {apiResponse.data[0].name}</p>
                  <p className="text-sm">Images: {apiResponse.data[0].images?.length || 0}</p>
                  {apiResponse.data[0].images?.[0] && (
                    <div className="mt-2">
                      <img 
                        src={apiResponse.data[0].images[0].url} 
                        alt={apiResponse.data[0].name}
                        className="w-32 h-32 object-cover rounded"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {apiResponse.data[0].images[0].url}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        {/* Redux State */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Redux State</h2>
          <p className="text-sm text-gray-600 mb-2">
            Loading: {isLoading ? 'Yes' : 'No'}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Error: {error || 'None'}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Products Count: {products?.length || 0}
          </p>
          {products?.[0] && (
            <div className="mt-4">
              <h3 className="font-medium">First Product:</h3>
              <p className="text-sm">Name: {products[0].name}</p>
              <p className="text-sm">Images: {products[0].images?.length || 0}</p>
              {products[0].images?.[0] && (
                <div className="mt-2">
                  <img 
                    src={products[0].images[0].url} 
                    alt={products[0].name}
                    className="w-32 h-32 object-cover rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {products[0].images[0].url}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Raw Data */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Raw API Response</h2>
        <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(apiResponse, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default APITest
