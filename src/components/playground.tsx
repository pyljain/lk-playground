"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  User, 
  Link2, 
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Key,
  Globe,
  Skull,
  MessageSquare,
  Bomb,
  Swords,
} from "lucide-react";
import { LakeraResponse, makeLakeraAPICall } from '@/app/lib/lakera';

const LakeraPlayground = () => {
  const [prompt, setPrompt] = useState('');
  const [promptType, setPromptType] = useState('user');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LakeraResponse | null>(null);
  
  const getDetectorIcon = (type: string) => {
    const icons: { [key: string]: JSX.Element } = {
      'pii/name': <User className="h-4 w-4" />,
      'pii/email': <Mail className="h-4 w-4" />,
      'pii/phone_number': <Phone className="h-4 w-4" />,
      'pii/address': <MapPin className="h-4 w-4" />,
      'pii/credit_card': <CreditCard className="h-4 w-4" />,
      'pii/us_social_security_number': <Key className="h-4 w-4" />,
      'pii/ip_address': <Globe className="h-4 w-4" />,
      'pii/iban_code': <Globe className="h-4 w-4" />,
      'unknown_links': <Link2 className="h-4 w-4" />,
      'prompt_attack': <Bomb className="h-4 w-4" />,
      'moderated_content/hate': <MessageSquare className="h-4 w-4" />,
      'moderated_content/violence': <Skull className="h-4 w-4" />,
      'moderated_content/weapons': <Swords className="h-4 w-4" />,
      'moderated_content/crime': <Swords className="h-4 w-4" />,
    };
    return icons[type] || <AlertTriangle className="h-4 w-4" />;
  };
  
  const categorizeBreakdown = (breakdown: LakeraResponse['breakdown']) => {
    return breakdown.reduce((acc: { [key: string]: LakeraResponse['breakdown'] }, item) => {
      const category = item.detector_type.split('/')[0];
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'pii': 'Personal Information',
      'moderated_content': 'Content Moderation',
      'prompt_attack': 'Prompt Attacks',
      'unknown_links': 'Unknown Links'
    };
    return labels[category] || category;
  };
  
  // Mock results for demonstration
  const handleCheck = async () => {
    setLoading(true);
    const response = await makeLakeraAPICall(promptType, prompt);
    setResults(response);
    setLoading(false);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
    <Card>
    <CardHeader>
    <CardTitle className="flex items-center gap-2">
    <Shield className="h-6 w-6" />
    Lakera Playground
    </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
    <div className="space-y-2">
    <label className="text-sm font-medium">Prompt Type</label>
    <Select value={promptType} onValueChange={setPromptType}>
    <SelectTrigger className="w-full">
    <SelectValue placeholder="Select prompt type" />
    </SelectTrigger>
    <SelectContent>
    <SelectItem value="system">System Prompt</SelectItem>
    <SelectItem value="user">User Prompt</SelectItem>
    </SelectContent>
    </Select>
    </div>
    
    <div className="space-y-2">
    <label className="text-sm font-medium">Enter your prompt</label>
    <Textarea 
    placeholder="Enter your prompt here..." 
    className="min-h-[200px]"
    value={prompt}
    onChange={(e) => setPrompt(e.target.value)}
    />
    </div>
    
    <Button 
    onClick={handleCheck} 
    disabled={!prompt || loading}
    className="w-full"
    >
    {loading ? "Checking..." : "Check Prompt"}
    </Button>
    </CardContent>
    </Card>
    
    {results && (
      <Card>
      <CardHeader>
      <CardTitle className="flex items-center gap-2">
      <Shield className="h-6 w-6" />
      Analysis Results
      </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
      {results.payload.length > 0 || results.breakdown.length > 0 ? (
        <div className="space-y-4">
        {results && (
        <div className="space-y-6">
          {/* Detections Card */}
          {results.payload.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                  Detected Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.payload.map((detection, index) => (
                  <div 
                    key={index} 
                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getDetectorIcon(detection.detector_type)}
                      <span className="font-medium text-slate-700">
                        {detection.detector_type.split('/')[1]?.toUpperCase() || detection.detector_type}
                      </span>
                    </div>
                    <div className="pl-6 space-y-2">
                      <div className="flex gap-2 text-sm text-slate-600">
                        <span className="font-medium">Found Text:</span>
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">
                          {detection.text}
                        </span>
                      </div>
                      <div className="flex gap-2 text-sm text-slate-600">
                        <span className="font-medium">Position:</span>
                        <span>Characters {detection.start} to {detection.end}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Breakdown Card */}
          <Card>
            <CardHeader>
              <CardTitle>Security Check Results</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(categorizeBreakdown(results.breakdown)).map(([category, items]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-semibold mb-3">
                    {getCategoryLabel(category)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((item, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border ${
                          item.detected 
                            ? 'bg-amber-50 border-amber-200' 
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getDetectorIcon(item.detector_type)}
                            <span className="font-medium">
                              {item.detector_type.split('/')[1]?.replace(/_/g, ' ').toUpperCase() || 
                               item.detector_type.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.detected
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.detected ? 'Detected' : 'Clear'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        )}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-lg">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <div>
        <h3 className="font-medium text-green-800">No Issues Detected</h3>
        <p className="text-sm text-green-600">
        Your prompt appears to be clean of any concerning content.
        </p>
        </div>
        </div>
      )}
      </CardContent>
      </Card>
    )}
    </div>
  );
};

export default LakeraPlayground;