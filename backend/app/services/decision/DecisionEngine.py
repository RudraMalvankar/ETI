from app.schemas.decision import DecisionRequest, DecisionResponse
from app.services.decision.Retriever import Retriever
from app.services.decision.ContextBuilder import ContextBuilder
from app.services.decision.PromptBuilder import PromptBuilder
from app.services.decision.ScenarioEvaluator import ScenarioEvaluator
from app.services.decision.JSONValidator import JSONValidator
from app.services.decision.CitationResolver import CitationResolver
from app.services.decision.ConfidenceEngine import ConfidenceEngine

class DecisionEngine:
    """
    Main orchestrator for the AI Decision Engine pipeline.
    """
    def __init__(self):
        self.retriever = Retriever()
        self.context_builder = ContextBuilder()
        self.prompt_builder = PromptBuilder()
        self.evaluator = ScenarioEvaluator()
        self.validator = JSONValidator()
        self.citation_resolver = CitationResolver()
        self.confidence_engine = ConfidenceEngine()

    def make_decision(self, request: DecisionRequest) -> DecisionResponse:
        # 1. Retrieve relevant document chunks
        retrieved_chunks = self.retriever.retrieve_context(request.failed_asset, request.failure_type)
        
        # 2 & 3 & 4. Collect graph results, simulation outputs and Assemble context
        context = self.context_builder.build_context(request.failed_asset, request.simulation_id, retrieved_chunks)
        
        # 5. Generate structured prompt
        prompt = self.prompt_builder.build_prompt(context)
        
        # 6. Call LLM
        raw_llm_output = self.evaluator.evaluate(prompt, context)
        
        # 7. Validate JSON
        parsed_json = self.validator.validate_and_parse(raw_llm_output)
        
        # 8. Resolve Citations (Guardrail)
        valid_citations = self.citation_resolver.resolve_citations(parsed_json.get("supporting_citations", []), retrieved_chunks)
        parsed_json["supporting_citations"] = valid_citations
        
        # 9. Compute Confidence Score
        parsed_json["confidence_score"] = self.confidence_engine.compute_confidence(context, len(valid_citations))
        
        return DecisionResponse(**parsed_json)
