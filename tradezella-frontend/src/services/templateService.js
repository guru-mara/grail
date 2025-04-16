// src/services/templateService.js
import api from './apiService';

// Get all templates
const getTemplates = async () => {
  try {
    const response = await api.get('/api/templates');
    return response.data;
  } catch (error) {
    console.error('Error fetching templates:', error);
    // Return empty array instead of throwing error
    return [];
  }
};

// Get template by ID
const getTemplateById = async (id) => {
  try {
    const response = await api.get(`/api/templates/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching template with ID ${id}:`, error);
    throw error;
  }
};

// Create new template
const createTemplate = async (templateData) => {
  try {
    const response = await api.post('/api/templates', templateData);
    return response.data;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

// Update template
const updateTemplate = async (id, templateData) => {
  try {
    const response = await api.put(`/api/templates/${id}`, templateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating template with ID ${id}:`, error);
    throw error;
  }
};

// Delete template
const deleteTemplate = async (id) => {
  try {
    const response = await api.delete(`/api/templates/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting template with ID ${id}:`, error);
    throw error;
  }
};

// Create a named object for export
const templateService = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
};

export default templateService;