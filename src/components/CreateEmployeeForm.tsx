import { useState, FormEvent } from 'react';
import axios from 'axios';
import { createEmployee } from '../utils/api';
import type { CreateEmployeeRequest } from '../utils/api';
import { toast } from 'react-toastify';
import './CreateEmployeeForm.css';

interface CreateEmployeeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateEmployeeForm = ({ onSuccess, onCancel }: CreateEmployeeFormProps) => {
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    name: '',
    national_id: '',
    identifier: '',
    password: '',
    destination_id: 1,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateEmployeeRequest, string>>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateEmployeeRequest, string>> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }
    if (!formData.national_id.trim()) {
      newErrors.national_id = 'الهوية الوطنية مطلوبة';
    }
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'المعرف مطلوب';
    } else if (!formData.identifier.startsWith('+')) {
      newErrors.identifier = 'يجب أن يبدأ المعرف بعلامة +';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'يجب أن تكون كلمة المرور 6 أحرف على الأقل';
    }
    if (!formData.destination_id || formData.destination_id < 1) {
      newErrors.destination_id = 'رقم الجهة مطلوب';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('يرجى إصلاح الأخطاء في النموذج');
      return;
    }
    setIsLoading(true);
    try {
      const response = await createEmployee(formData);
      if (response.success) {
        toast.success('Employee created successfully!');
        onSuccess();
        setFormData({
          name: '',
          national_id: '',
          identifier: '',
          password: '',
          destination_id: 1,
        });
        setErrors({});
      } else {
        toast.error(response.message || 'Failed to create employee');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to create employee. Please try again.';
        toast.error(errorMessage);
        if (error.response?.status === 401) {
          onCancel();
        }
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CreateEmployeeRequest, value: string | number): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-employee-form">
      <div className="form-group">
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="أدخل اسم الموظف"
          disabled={isLoading}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>
      <div className="form-group">
        <input
          id="national_id"
          type="text"
          value={formData.national_id}
          onChange={(e) => handleChange('national_id', e.target.value)}
          placeholder="أدخل الهوية الوطنية"
          disabled={isLoading}
          className={errors.national_id ? 'error' : ''}
        />
        {errors.national_id && <span className="error-message">{errors.national_id}</span>}
      </div>
      <div className="form-group">
        <input
          id="identifier"
          type="text"
          value={formData.identifier}
          onChange={(e) => handleChange('identifier', e.target.value)}
          placeholder="أدخل المعرف (+963980453436)"
          disabled={isLoading}
          className={errors.identifier ? 'error' : ''}
        />
        {errors.identifier && <span className="error-message">{errors.identifier}</span>}
      </div>
      <div className="form-group">
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
          disabled={isLoading}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="error-message">{errors.password}</span>}
      </div>
      <div className="form-group">
        <input
          id="destination_id"
          type="number"
          value={formData.destination_id}
          onChange={(e) => handleChange('destination_id', parseInt(e.target.value, 10))}
          placeholder="أدخل رقم الجهة"
          disabled={isLoading}
          min="1"
          className={errors.destination_id ? 'error' : ''}
        />
        {errors.destination_id && <span className="error-message">{errors.destination_id}</span>}
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-button" disabled={isLoading}>
          إلغاء
        </button>
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'جاري الإنشاء...' : 'إنشاء موظف'}
        </button>
      </div>
    </form>
  );
};

export default CreateEmployeeForm;

