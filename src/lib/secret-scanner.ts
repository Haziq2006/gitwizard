import { SecretType, SecretPattern, ScanResult } from '@/types';

export class SecretScanner {
  private patterns: SecretPattern[] = [
    {
      type: SecretType.AWS_ACCESS_KEY,
      pattern: /AKIA[0-9A-Z]{16}/g,
      description: 'AWS Access Key ID',
      examples: ['AKIAIOSFODNN7EXAMPLE']
    },
    {
      type: SecretType.AWS_SECRET_KEY,
      pattern: /[0-9a-zA-Z/+]{40}/g,
      description: 'AWS Secret Access Key',
      examples: ['wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY']
    },
    {
      type: SecretType.STRIPE_SECRET_KEY,
      pattern: /sk_(live|test)_[0-9a-zA-Z]{24}/g,
      description: 'Stripe Secret Key',
      examples: ['sk_live_51H1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.STRIPE_PUBLISHABLE_KEY,
      pattern: /pk_(live|test)_[0-9a-zA-Z]{24}/g,
      description: 'Stripe Publishable Key',
      examples: ['pk_live_51H1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.GITHUB_TOKEN,
      pattern: /ghp_[0-9a-zA-Z]{36}/g,
      description: 'GitHub Personal Access Token',
      examples: ['ghp_1234567890abcdefghijklmnopqrstuvwxyz123456']
    },
    {
      type: SecretType.GITHUB_PERSONAL_ACCESS_TOKEN,
      pattern: /github_pat_[0-9a-zA-Z_]{82}/g,
      description: 'GitHub Fine-grained Personal Access Token',
      examples: ['github_pat_11A1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz123456']
    },
    {
      type: SecretType.DATABASE_URL,
      pattern: /(mongodb|postgresql|mysql|redis):\/\/[^:\s]+:[^@\s]+@[^:\s]+:[0-9]+\/[^?\s]+/g,
      description: 'Database Connection URL',
      examples: ['postgresql://user:password@localhost:5432/database']
    },
    {
      type: SecretType.JWT_SECRET,
      pattern: /jwt_secret["\s]*[:=]["\s]*[0-9a-zA-Z]{32,}/gi,
      description: 'JWT Secret',
      examples: ['jwt_secret: "your-super-secret-jwt-key-here"']
    },
    {
      type: SecretType.API_KEY,
      pattern: /(api_key|apikey|api-key)["\s]*[:=]["\s]*[0-9a-zA-Z]{20,}/gi,
      description: 'Generic API Key',
      examples: ['api_key: "your-api-key-here"']
    },
    {
      type: SecretType.OPENAI_API_KEY,
      pattern: /sk-[0-9a-zA-Z]{48}/g,
      description: 'OpenAI API Key',
      examples: ['sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.ANTHROPIC_API_KEY,
      pattern: /sk-ant-[0-9a-zA-Z]{48}/g,
      description: 'Anthropic Claude API Key',
      examples: ['sk-ant-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.DEEPSEEK_API_KEY,
      pattern: /sk-[0-9a-zA-Z]{32,}/g,
      description: 'DeepSeek API Key',
      examples: ['sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.GOOGLE_AI_API_KEY,
      pattern: /AIza[0-9A-Za-z-_]{35}/g,
      description: 'Google AI API Key',
      examples: ['AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.HUGGINGFACE_API_KEY,
      pattern: /hf_[0-9a-zA-Z]{39}/g,
      description: 'Hugging Face API Key',
      examples: ['hf_1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.COHERE_API_KEY,
      pattern: /sk-[0-9a-zA-Z]{48}/g,
      description: 'Cohere API Key',
      examples: ['sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.REPLICATE_API_KEY,
      pattern: /r8_[0-9a-zA-Z]{37}/g,
      description: 'Replicate API Key',
      examples: ['r8_1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.TOGETHER_AI_API_KEY,
      pattern: /sk-[0-9a-zA-Z]{48}/g,
      description: 'Together AI API Key',
      examples: ['sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.AZURE_OPENAI_API_KEY,
      pattern: /sk-[0-9a-zA-Z]{32}/g,
      description: 'Azure OpenAI API Key',
      examples: ['sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.GOOGLE_CLOUD_API_KEY,
      pattern: /AIza[0-9A-Za-z-_]{35}/g,
      description: 'Google Cloud API Key',
      examples: ['AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.FIREBASE_API_KEY,
      pattern: /AIza[0-9A-Za-z-_]{35}/g,
      description: 'Firebase API Key',
      examples: ['AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.SENDGRID_API_KEY,
      pattern: /SG\.[0-9a-zA-Z]{22}\.[0-9a-zA-Z]{43}/g,
      description: 'SendGrid API Key',
      examples: ['SG.1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.TWILIO_API_KEY,
      pattern: /SK[0-9a-f]{32}/g,
      description: 'Twilio API Key',
      examples: ['SK1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.MAILGUN_API_KEY,
      pattern: /key-[0-9a-f]{32}/g,
      description: 'Mailgun API Key',
      examples: ['key-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.ALGOLIA_API_KEY,
      pattern: /[0-9a-f]{32}/g,
      description: 'Algolia API Key',
      examples: ['1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz']
    },
    {
      type: SecretType.PRIVATE_KEY,
      pattern: /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g,
      description: 'Private Key (PEM format)',
      examples: ['-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----']
    },
    {
      type: SecretType.SSH_KEY,
      pattern: /-----BEGIN OPENSSH PRIVATE KEY-----[\s\S]*?-----END OPENSSH PRIVATE KEY-----/g,
      description: 'SSH Private Key',
      examples: ['-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn\n-----END OPENSSH PRIVATE KEY-----']
    }
  ];

  /**
   * Scan content for secrets
   */
  public scanContent(content: string, filePath: string): ScanResult {
    const secrets: ScanResult['secrets'] = [];
    
    const lines = content.split('\n');
    
    for (let lineNumber = 1; lineNumber <= lines.length; lineNumber++) {
      const line = lines[lineNumber - 1];
      
      for (const pattern of this.patterns) {
        const matches = line.match(pattern.pattern);
        
        if (matches) {
          for (const match of matches) {
            // Skip if it's a comment or documentation
            if (this.isCommentOrDocumentation(line, filePath)) {
              continue;
            }
            
            // Skip if it's a test file or example
            if (this.isTestOrExampleFile(filePath)) {
              continue;
            }
            
            secrets.push({
              type: pattern.type,
              value: match,
              lineNumber,
              filePath
            });
          }
        }
      }
    }
    
    return {
      found: secrets.length > 0,
      secrets
    };
  }

  /**
   * Scan multiple files for secrets
   */
  public scanFiles(files: Array<{ content: string; path: string }>): ScanResult {
    const allSecrets: ScanResult['secrets'] = [];
    
    for (const file of files) {
      const result = this.scanContent(file.content, file.path);
      allSecrets.push(...result.secrets);
    }
    
    return {
      found: allSecrets.length > 0,
      secrets: allSecrets
    };
  }

  /**
   * Check if a line is a comment or documentation
   */
  private isCommentOrDocumentation(line: string, filePath: string): boolean {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) return true;
    
    // Skip comment lines
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) return true;
    if (trimmedLine.startsWith('/*') || trimmedLine.startsWith('*/')) return true;
    if (trimmedLine.startsWith('<!--') || trimmedLine.startsWith('-->')) return true;
    
    // Skip documentation files
    const docExtensions = ['.md', '.txt', '.rst', '.adoc'];
    const isDocFile = docExtensions.some(ext => filePath.endsWith(ext));
    if (isDocFile) return true;
    
    return false;
  }

  /**
   * Check if a file is a test or example file
   */
  private isTestOrExampleFile(filePath: string): boolean {
    const testPatterns = [
      /test/i,
      /spec/i,
      /example/i,
      /sample/i,
      /demo/i,
      /mock/i,
      /fixture/i
    ];
    
    const fileName = filePath.split('/').pop() || '';
    const directory = filePath.split('/').slice(0, -1).join('/');
    
    // Check if file name contains test patterns
    if (testPatterns.some(pattern => pattern.test(fileName))) {
      return true;
    }
    
    // Check if directory contains test patterns
    if (testPatterns.some(pattern => pattern.test(directory))) {
      return true;
    }
    
    return false;
  }

  /**
   * Get all supported secret types
   */
  public getSupportedTypes(): SecretPattern[] {
    return this.patterns;
  }

  /**
   * Add custom pattern
   */
  public addCustomPattern(pattern: Omit<SecretPattern, 'type'> & { type: SecretType.CUSTOM }): void {
    this.patterns.push(pattern);
  }

  /**
   * Validate if a string matches a specific secret type
   */
  public validateSecret(secret: string, type: SecretType): boolean {
    const pattern = this.patterns.find(p => p.type === type);
    if (!pattern) return false;
    
    return pattern.pattern.test(secret);
  }
} 