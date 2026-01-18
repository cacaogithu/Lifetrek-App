import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Globe, Home, Plane, Truck } from "lucide-react";

export interface TCOInputs {
    componentType: string;
    annualVolume: number;
    importUnitPrice: number;
    importFreight: number;
    importTaxesPercent: number;
    exchangeRate: number;
    importLeadTimeDays: number;
    stockCoverageMonths: number;
}

interface TCOFormProps {
    onCalculate: (data: TCOInputs) => void;
}

export function TCOForm({ onCalculate }: TCOFormProps) {
    const [formData, setFormData] = useState<TCOInputs>({
        componentType: "Bone Screw (Titânio)",
        annualVolume: 12000,
        importUnitPrice: 45.00,
        importFreight: 2500,
        importTaxesPercent: 60,
        exchangeRate: 5.85,
        importLeadTimeDays: 90,
        stockCoverageMonths: 6
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "componentType" ? value : parseFloat(value) || 0
        }));
    };

    return (
        <Card className="shadow-xl border-primary/10 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    Parâmetros de Análise
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="componentType">Tipo de Componente</Label>
                        <Input id="componentType" name="componentType" value={formData.componentType} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="annualVolume">Volume Anual (Unidades)</Label>
                        <Input id="annualVolume" name="annualVolume" type="number" value={formData.annualVolume} onChange={handleChange} />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Plane className="w-4 h-4" /> Cenário de Importação (USD)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="importUnitPrice">Preço Unitário (FOB)</Label>
                            <Input id="importUnitPrice" name="importUnitPrice" type="number" value={formData.importUnitPrice} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="importFreight">Frete Médio Lote</Label>
                            <Input id="importFreight" name="importFreight" type="number" value={formData.importFreight} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="importTaxesPercent">Impostos Totais (%)</Label>
                            <Input id="importTaxesPercent" name="importTaxesPercent" type="number" value={formData.importTaxesPercent} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Logística & Financeiro
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="exchangeRate">Câmbio (R$/USD)</Label>
                            <Input id="exchangeRate" name="exchangeRate" type="number" step="0.01" value={formData.exchangeRate} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="importLeadTimeDays">Lead Time Global (Dias)</Label>
                            <Input id="importLeadTimeDays" name="importLeadTimeDays" type="number" value={formData.importLeadTimeDays} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stockCoverageMonths">Meses de Estoque Atual</Label>
                            <Input id="stockCoverageMonths" name="stockCoverageMonths" type="number" value={formData.stockCoverageMonths} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <Button className="w-full py-6 text-lg gap-2" onClick={() => onCalculate(formData)}>
                    <Calculator className="w-5 h-5" />
                    Calcular ROI de Nacionalização
                </Button>
            </CardContent>
        </Card>
    );
}
