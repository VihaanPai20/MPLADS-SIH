import re

files = [
    'src/components/layout/GovernmentHeader.tsx',
    'src/components/layout/GovernmentBanner.tsx'
]

routes = ['mps', 'projects', 'risk-analysis', 'alerts', 'compliance', 'analytics', 'financial', 'project-execution', 'geographic', 'districts', 'agencies', 'assistant', 'reports', 'audit']

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for route in routes:
        content = content.replace(f'"/{route}"', f'"/dashboard/{route}"')
        content = content.replace(f"'/{route}'", f"'/dashboard/{route}'")
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
print('Fixed routes!')
