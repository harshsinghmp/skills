# Coupling Analysis Matrix Reference

## Coupling Metric Formula

$$C(T_A, T_B) = w_{\text{write}} \cdot O_{\text{write}} + w_{\text{type}} \cdot O_{\text{type}} + w_{\text{state}} \cdot O_{\text{state}}$$

Where:
- $O_{\text{write}} \in \{0, 1\}$ indicates shared target write files.
- $O_{\text{type}} \in \{0, 1\}$ indicates shared uncommitted type definitions or schema models.
- $O_{\text{state}} \in \{0, 1\}$ indicates shared mutable database tables or runtime singletons.
- Weights: $w_{\text{write}} = 0.5$, $w_{\text{type}} = 0.3$, $w_{\text{state}} = 0.2$.

If $\max C(T_i, T_j) \ge 0.6$, enforce sequential pipelining across $T_i$ and $T_j$.
