/**
 * Dynamic Sections Manager - Admin Component
 * Allows admins to manage homepage sections dynamically
 */

import React, { useState } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'

const DynamicSectionsManager = () => {
  const [sections, setSections] = useState([
    {
      id: 1,
      title: 'Electronics',
      category: 'electronics',
      isVisible: true,
      maxItems: 6,
      order: 1
    },
    {
      id: 2,
      title: 'Fashion',
      category: 'fashion',
      isVisible: true,
      maxItems: 6,
      order: 2
    },
    {
      id: 3,
      title: 'Home & Furniture',
      category: 'home',
      isVisible: true,
      maxItems: 6,
      order: 3
    },
    {
      id: 4,
      title: 'Books',
      category: 'books',
      isVisible: false,
      maxItems: 4,
      order: 4
    }
  ])

  const [isAddingSection, setIsAddingSection] = useState(false)
  const [editingSection, setEditingSection] = useState(null)

  const addSection = () => {
    setIsAddingSection(true)
  }

  const editSection = (section) => {
    setEditingSection(section)
  }

  const deleteSection = (sectionId) => {
    setSections(sections.filter(s => s.id !== sectionId))
  }

  const toggleVisibility = (sectionId) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s
    ))
  }

  const moveSection = (sectionId, direction) => {
    const currentIndex = sections.findIndex(s => s.id === sectionId)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (newIndex >= 0 && newIndex < sections.length) {
      const newSections = [...sections]
      const [movedSection] = newSections.splice(currentIndex, 1)
      newSections.splice(newIndex, 0, movedSection)
      
      // Update order
      const updatedSections = newSections.map((section, index) => ({
        ...section,
        order: index + 1
      }))
      
      setSections(updatedSections)
    }
  }

  const saveSection = (sectionData) => {
    if (editingSection) {
      setSections(sections.map(s => 
        s.id === editingSection.id ? { ...s, ...sectionData } : s
      ))
      setEditingSection(null)
    } else {
      const newSection = {
        id: Date.now(),
        ...sectionData,
        order: sections.length + 1,
        isVisible: true
      }
      setSections([...sections, newSection])
      setIsAddingSection(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Dynamic Sections Manager</h2>
        <button
          onClick={addSection}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Section</span>
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sections
          .sort((a, b) => a.order - b.order)
          .map((section, index) => (
            <div
              key={section.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => moveSection(section.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveSection(section.id, 'down')}
                    disabled={index === sections.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-500">
                    Category: {section.category} • Max Items: {section.maxItems}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleVisibility(section.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    section.isVisible
                      ? 'text-green-600 bg-green-50 hover:bg-green-100'
                      : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => editSection(section)}
                  className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => deleteSection(section.id)}
                  className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Add/Edit Section Modal */}
      {(isAddingSection || editingSection) && (
        <SectionForm
          section={editingSection}
          onSave={saveSection}
          onCancel={() => {
            setIsAddingSection(false)
            setEditingSection(null)
          }}
        />
      )}
    </div>
  )
}

// Section Form Component
const SectionForm = ({ section, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: section?.title || '',
    category: section?.category || '',
    maxItems: section?.maxItems || 6
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {section ? 'Edit Section' : 'Add New Section'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Furniture</option>
              <option value="books">Books</option>
              <option value="sports">Sports</option>
              <option value="beauty">Beauty</option>
              <option value="toys">Toys & Games</option>
              <option value="automotive">Automotive</option>
              <option value="grocery">Grocery</option>
              <option value="health">Health & Personal Care</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Items to Display
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={formData.maxItems}
              onChange={(e) => setFormData({ ...formData, maxItems: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {section ? 'Update' : 'Add'} Section
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DynamicSectionsManager





