getModelDisplayName(model) {
    const names = {
        'openai': 'GPT-4o',
        'mistral': 'Mistral',
        'llama': 'Llama 3',
        'claude': 'Claude 3',
        'gemini': 'Gemini'
    };
    return names[model] || model;
}
