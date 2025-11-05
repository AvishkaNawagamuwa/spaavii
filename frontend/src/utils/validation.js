/**
 * Validation utilities for SPA Registration Form
 */

// Sri Lankan NIC Validation (Old and New formats)
export const validateNIC = (nic) => {
    if (!nic || typeof nic !== 'string') {
        return { valid: false, message: 'NIC is required' };
    }

    const trimmedNIC = nic.trim();

    // Old NIC format: 9 digits + 1 letter (V or X) - Total 10 characters
    const oldNICPattern = /^[0-9]{9}[VXvx]$/;

    // New NIC format: 12 digits only - Total 12 characters
    const newNICPattern = /^[0-9]{12}$/;

    if (oldNICPattern.test(trimmedNIC)) {
        return { valid: true, type: 'old', message: 'Valid old NIC format' };
    } else if (newNICPattern.test(trimmedNIC)) {
        return { valid: true, type: 'new', message: 'Valid new NIC format' };
    } else {
        return {
            valid: false,
            message: 'Invalid NIC format. Use either old format (9 digits + V/X) or new format (12 digits)'
        };
    }
};

// Email Validation
export const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return { valid: false, message: 'Email is required' };
    }

    const trimmedEmail = email.trim();
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(trimmedEmail)) {
        return { valid: false, message: 'Please enter a valid email address' };
    }

    if (trimmedEmail.length > 100) {
        return { valid: false, message: 'Email address is too long (max 100 characters)' };
    }

    return { valid: true, message: 'Valid email' };
};

// Phone Number Validation (Sri Lankan format)
export const validatePhone = (phone, fieldName = 'Phone') => {
    if (!phone || typeof phone !== 'string') {
        return { valid: false, message: `${fieldName} is required` };
    }

    const trimmedPhone = phone.trim().replace(/[\s-]/g, ''); // Remove spaces and dashes

    // Sri Lankan phone formats:
    // Landline: 0XX-XXXXXXX (10 digits starting with 0)
    // Mobile: 07X-XXXXXXX (10 digits starting with 07)
    const phonePattern = /^0[0-9]{9}$/;

    if (!phonePattern.test(trimmedPhone)) {
        return {
            valid: false,
            message: `${fieldName} must be 10 digits starting with 0 (e.g., 0112345678 or 0771234567)`
        };
    }

    return { valid: true, message: `Valid ${fieldName}` };
};

// Name Validation
export const validateName = (name, fieldName = 'Name') => {
    if (!name || typeof name !== 'string') {
        return { valid: false, message: `${fieldName} is required` };
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
        return { valid: false, message: `${fieldName} must be at least 2 characters` };
    }

    if (trimmedName.length > 50) {
        return { valid: false, message: `${fieldName} must not exceed 50 characters` };
    }

    // Allow letters, spaces, hyphens, and apostrophes
    const namePattern = /^[a-zA-Z\s'-]+$/;
    if (!namePattern.test(trimmedName)) {
        return {
            valid: false,
            message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
        };
    }

    return { valid: true, message: `Valid ${fieldName}` };
};

// Spa Name Validation
export const validateSpaName = (spaName) => {
    if (!spaName || typeof spaName !== 'string') {
        return { valid: false, message: 'Spa Name is required' };
    }

    const trimmedName = spaName.trim();

    if (trimmedName.length < 3) {
        return { valid: false, message: 'Spa Name must be at least 3 characters' };
    }

    if (trimmedName.length > 100) {
        return { valid: false, message: 'Spa Name must not exceed 100 characters' };
    }

    // Allow letters, numbers, spaces, and common business characters
    const spaNamePattern = /^[a-zA-Z0-9\s&.,'-]+$/;
    if (!spaNamePattern.test(trimmedName)) {
        return {
            valid: false,
            message: 'Spa Name contains invalid characters'
        };
    }

    return { valid: true, message: 'Valid Spa Name' };
};

// Address Validation
export const validateAddress = (address, fieldName = 'Address') => {
    if (!address || typeof address !== 'string') {
        return { valid: false, message: `${fieldName} is required` };
    }

    const trimmedAddress = address.trim();

    if (trimmedAddress.length < 5) {
        return { valid: false, message: `${fieldName} must be at least 5 characters` };
    }

    if (trimmedAddress.length > 200) {
        return { valid: false, message: `${fieldName} must not exceed 200 characters` };
    }

    return { valid: true, message: `Valid ${fieldName}` };
};

// Postal Code Validation (Sri Lankan)
export const validatePostalCode = (postalCode) => {
    if (!postalCode || typeof postalCode !== 'string') {
        return { valid: false, message: 'Postal Code is required' };
    }

    const trimmedCode = postalCode.trim();

    // Sri Lankan postal codes are 5 digits
    const postalCodePattern = /^[0-9]{5}$/;

    if (!postalCodePattern.test(trimmedCode)) {
        return {
            valid: false,
            message: 'Postal Code must be 5 digits (e.g., 10100)'
        };
    }

    return { valid: true, message: 'Valid Postal Code' };
};

// BR Number Validation (Business Registration Number)
export const validateBRNumber = (brNumber) => {
    if (!brNumber || typeof brNumber !== 'string') {
        return { valid: false, message: 'BR Number is required' };
    }

    const trimmedBR = brNumber.trim();

    if (trimmedBR.length < 3) {
        return { valid: false, message: 'BR Number must be at least 3 characters' };
    }

    if (trimmedBR.length > 20) {
        return { valid: false, message: 'BR Number must not exceed 20 characters' };
    }

    // Allow alphanumeric and common separators
    const brPattern = /^[a-zA-Z0-9\-/]+$/;
    if (!brPattern.test(trimmedBR)) {
        return {
            valid: false,
            message: 'BR Number can only contain letters, numbers, hyphens, and slashes'
        };
    }

    return { valid: true, message: 'Valid BR Number' };
};

// File Validation
export const validateFile = (file, fieldName, options = {}) => {
    const {
        required = true,
        maxSize = 10 * 1024 * 1024, // 10MB default
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
        allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']
    } = options;

    if (!file) {
        if (required) {
            return { valid: false, message: `${fieldName} is required` };
        }
        return { valid: true, message: `${fieldName} is optional` };
    }

    // Check file size
    if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        return {
            valid: false,
            message: `${fieldName} must be smaller than ${maxSizeMB}MB`
        };
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        return {
            valid: false,
            message: `${fieldName} must be one of: ${allowedExtensions.join(', ')}`
        };
    }

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            message: `${fieldName} has invalid file type`
        };
    }

    return { valid: true, message: `Valid ${fieldName}` };
};

// Validate all personal information fields
export const validatePersonalInfo = (userDetails) => {
    const errors = {};

    // First Name
    const firstNameValidation = validateName(userDetails.firstName, 'First Name');
    if (!firstNameValidation.valid) {
        errors.firstName = firstNameValidation.message;
    }

    // Last Name
    const lastNameValidation = validateName(userDetails.lastName, 'Last Name');
    if (!lastNameValidation.valid) {
        errors.lastName = lastNameValidation.message;
    }

    // Email
    const emailValidation = validateEmail(userDetails.email);
    if (!emailValidation.valid) {
        errors.email = emailValidation.message;
    }

    // NIC
    const nicValidation = validateNIC(userDetails.nicNo);
    if (!nicValidation.valid) {
        errors.nicNo = nicValidation.message;
    }

    // Telephone
    const telephoneValidation = validatePhone(userDetails.telephone, 'Telephone');
    if (!telephoneValidation.valid) {
        errors.telephone = telephoneValidation.message;
    }

    // Cell Phone
    const cellphoneValidation = validatePhone(userDetails.cellphone, 'Cell Phone');
    if (!cellphoneValidation.valid) {
        errors.cellphone = cellphoneValidation.message;
    }

    // NIC Front Photo
    const nicFrontValidation = validateFile(userDetails.nicFront, 'NIC Front Photo', {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
        allowedExtensions: ['.jpg', '.jpeg', '.png']
    });
    if (!nicFrontValidation.valid) {
        errors.nicFront = nicFrontValidation.message;
    }

    // NIC Back Photo
    const nicBackValidation = validateFile(userDetails.nicBack, 'NIC Back Photo', {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
        allowedExtensions: ['.jpg', '.jpeg', '.png']
    });
    if (!nicBackValidation.valid) {
        errors.nicBack = nicBackValidation.message;
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
};

// Validate all spa information fields
export const validateSpaInfo = (userDetails) => {
    const errors = {};

    // Spa Name
    const spaNameValidation = validateSpaName(userDetails.spaName);
    if (!spaNameValidation.valid) {
        errors.spaName = spaNameValidation.message;
    }

    // Spa Address Line 1
    const addressLine1Validation = validateAddress(userDetails.spaAddressLine1, 'Address Line 1');
    if (!addressLine1Validation.valid) {
        errors.spaAddressLine1 = addressLine1Validation.message;
    }

    // Spa Address Line 2 (optional)
    if (userDetails.spaAddressLine2 && userDetails.spaAddressLine2.trim() !== '') {
        const addressLine2Validation = validateAddress(userDetails.spaAddressLine2, 'Address Line 2');
        if (!addressLine2Validation.valid) {
            errors.spaAddressLine2 = addressLine2Validation.message;
        }
    }

    // Province
    const provinceValidation = validateName(userDetails.spaProvince, 'Province');
    if (!provinceValidation.valid) {
        errors.spaProvince = provinceValidation.message;
    }

    // Postal Code
    const postalCodeValidation = validatePostalCode(userDetails.spaPostalCode);
    if (!postalCodeValidation.valid) {
        errors.spaPostalCode = postalCodeValidation.message;
    }

    // Spa Telephone
    const spaTelephoneValidation = validatePhone(userDetails.spaTelephone, 'Spa Telephone');
    if (!spaTelephoneValidation.valid) {
        errors.spaTelephone = spaTelephoneValidation.message;
    }

    // Spa BR Number
    const brNumberValidation = validateBRNumber(userDetails.spaBRNumber);
    if (!brNumberValidation.valid) {
        errors.spaBRNumber = brNumberValidation.message;
    }

    // BR Attachment
    const brAttachmentValidation = validateFile(userDetails.brAttachment, 'BR Attachment', {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        allowedExtensions: ['.pdf', '.doc', '.docx']
    });
    if (!brAttachmentValidation.valid) {
        errors.brAttachment = brAttachmentValidation.message;
    }

    // Form 1 Certificate
    const form1CertValidation = validateFile(userDetails.form1Certificate, 'Form 1 Certificate', {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        allowedExtensions: ['.pdf', '.doc', '.docx']
    });
    if (!form1CertValidation.valid) {
        errors.form1Certificate = form1CertValidation.message;
    }

    // Spa Photos Banner
    const bannerValidation = validateFile(userDetails.spaPhotosBanner, 'Spa Photos Banner', {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
        allowedExtensions: ['.jpg', '.jpeg', '.png']
    });
    if (!bannerValidation.valid) {
        errors.spaPhotosBanner = bannerValidation.message;
    }

    // Other Document (optional)
    if (userDetails.otherDocument) {
        const otherDocValidation = validateFile(userDetails.otherDocument, 'Other Document', {
            required: false,
            maxSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'],
            allowedExtensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
        });
        if (!otherDocValidation.valid) {
            errors.otherDocument = otherDocValidation.message;
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
};

// Validate all form fields
export const validateAllFields = (userDetails) => {
    const personalInfoValidation = validatePersonalInfo(userDetails);
    const spaInfoValidation = validateSpaInfo(userDetails);

    return {
        valid: personalInfoValidation.valid && spaInfoValidation.valid,
        errors: {
            ...personalInfoValidation.errors,
            ...spaInfoValidation.errors
        }
    };
};

// ====== ASYNC VALIDATION FUNCTIONS ======

// Check if email already exists in database
export const checkEmailExists = async (email) => {
    try {
        if (!email || !email.trim()) {
            return { exists: false, error: null };
        }

        const response = await fetch(`/api/enhanced-registration/check-email/${encodeURIComponent(email.trim())}`);
        const data = await response.json();

        if (response.ok) {
            return {
                exists: data.exists,
                error: data.exists ? data.message : null
            };
        } else {
            console.error('Error checking email:', data);
            return { exists: false, error: null };
        }
    } catch (error) {
        console.error('Error checking email:', error);
        return { exists: false, error: null };
    }
};

// Check if NIC already exists in database
export const checkNICExists = async (nic) => {
    try {
        if (!nic || !nic.trim()) {
            return { exists: false, error: null };
        }

        const response = await fetch(`/api/enhanced-registration/check-nic/${encodeURIComponent(nic.trim())}`);
        const data = await response.json();

        if (response.ok) {
            return {
                exists: data.exists,
                error: data.exists ? data.message : null
            };
        } else {
            console.error('Error checking NIC:', data);
            return { exists: false, error: null };
        }
    } catch (error) {
        console.error('Error checking NIC:', error);
        return { exists: false, error: null };
    }
};

// Validate email with duplication check
export const validateEmailAsync = async (email) => {
    // First check format
    const formatValidation = validateEmail(email);
    if (!formatValidation.valid) {
        return formatValidation;
    }

    // Then check if exists in database
    const existsCheck = await checkEmailExists(email);
    if (existsCheck.exists) {
        return {
            valid: false,
            message: existsCheck.error || 'This email is already registered in our system'
        };
    }

    return { valid: true, message: 'Valid email' };
};

// Validate NIC with duplication check
export const validateNICAsync = async (nic) => {
    // First check format
    const formatValidation = validateNIC(nic);
    if (!formatValidation.valid) {
        return formatValidation;
    }

    // Then check if exists in database
    const existsCheck = await checkNICExists(nic);
    if (existsCheck.exists) {
        return {
            valid: false,
            message: existsCheck.error || 'This NIC is already registered in our system'
        };
    }

    return { valid: true, type: formatValidation.type, message: 'Valid NIC' };
};
